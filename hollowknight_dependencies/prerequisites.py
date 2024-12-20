import re
from functools import cache, partial

from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS, ItemType, PrerequisiteSpec, Progress, ProgressionItem

ID_INFECTED_CROSSROADS = "infected-crossroads"


class PrerequisiteExpressionError(Exception):
    """raised when a prerequisite expression is invalid"""


@cache
def convert_prerequisites_expression(prerequisite_expression: str) -> str:
    prerequisite_expression = re.sub(r"!", " not ", prerequisite_expression)
    prerequisite_expression = re.sub(r"&&", " and ", prerequisite_expression)
    prerequisite_expression = re.sub(r"\|\|", " or ", prerequisite_expression)
    prerequisite_expression = re.sub(r"`simple-key`", " has_simple_key_unused(items_completed) ", prerequisite_expression)
    prerequisite_expression = re.sub(r"`([^`]*)`", r'("\1" in items_completed_ids)', prerequisite_expression)
    return prerequisite_expression


def count_completed_items_of_type(item_type: ItemType, items_completed: list[ProgressionItem]) -> int:
    return sum(item.item_type == item_type for item in items_completed)


def _requires_simple_key(prerequisites: PrerequisiteSpec) -> bool:
    if not isinstance(prerequisites, str):
        return False
    return re.search(r"`simple-key`|\bhas_simple_key_unused\(", prerequisites) is not None


def has_simple_key_unused(items_completed: set[ProgressionItem]) -> bool:
    n_keys_found = sum(item.item_type == ItemType.SIMPLE_KEY for item in items_completed)
    n_keys_used = sum(_requires_simple_key(item.prerequisites) for item in items_completed)
    return n_keys_found > n_keys_used


def prerequisites_are_satisfied(prerequisites_spec: PrerequisiteSpec, items_completed_ids: set[str]) -> bool:
    if isinstance(prerequisites_spec, set):
        return prerequisites_spec.issubset(items_completed_ids)
    if not isinstance(prerequisites_spec, str):
        raise TypeError(f"Unexpected type for prerequisites_spec: {type(prerequisites_spec)}")
    converted_expression = convert_prerequisites_expression(prerequisites_spec)
    items_completed = [ALL_PROGRESSION_ITEMS[id_] for id_ in items_completed_ids]
    _locals = {
        "re": re,
        "items_completed_ids": items_completed_ids,
        "items_completed": items_completed,
        "count_completed_items_of_type": partial(count_completed_items_of_type, items_completed=items_completed),
    }
    try:
        result = eval(converted_expression, globals(), _locals)
    except Exception as e:
        raise PrerequisiteExpressionError("Failed to evaluate prerequisite expression") from e
    if not isinstance(result, bool):
        raise PrerequisiteExpressionError("prerequisite expression does not evaluate to a boolean")
    return result


def analyze_progress(items_completed_ids: set[str]) -> Progress:
    items_available = set()
    items_blocked = set()
    for item in ALL_PROGRESSION_ITEMS.values():
        if item.id in items_completed_ids:
            continue
        if prerequisites_are_satisfied(item.prerequisites, items_completed_ids):
            items_available.add(item.id)
        else:
            items_blocked.add(item.id)
    # also analyze hypotheticals
    hypotheticals = {}
    for item_id in items_available:
        hypothetical_items_completed_ids = items_completed_ids | {item_id}
        hypothetical_unlocked_item_ids = set()
        for blocked_item_id in items_blocked:
            blocked_item = ALL_PROGRESSION_ITEMS[blocked_item_id]
            if prerequisites_are_satisfied(blocked_item.prerequisites, hypothetical_items_completed_ids):
                hypothetical_unlocked_item_ids.add(blocked_item_id)
        if len(hypothetical_unlocked_item_ids) > 0:
            hypotheticals[item_id] = hypothetical_unlocked_item_ids
    # return data
    return Progress(
        items_completed=items_completed_ids,
        items_available=items_available,
        items_locked=items_blocked,
        hypotheticals=hypotheticals,
    )
