import re
from functools import cache

from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS, ItemType, PrerequisiteSpec, Progress


class PrerequisiteExpressionError(Exception):
    """raised when a prerequisite expression is invalid"""


@cache
def convert_prerequisites_expression(prerequisite_expression: str) -> str:
    prerequisite_expression = re.sub(r"!", " not ", prerequisite_expression)
    prerequisite_expression = re.sub(r"&&", " and ", prerequisite_expression)
    prerequisite_expression = re.sub(r"\|\|", " or ", prerequisite_expression)
    prerequisite_expression = re.sub(r"`([^`]*)`", r'("\1" in items_completed)', prerequisite_expression)
    return prerequisite_expression


def count_charms(items_completed: set[str]) -> int:
    return sum(ALL_PROGRESSION_ITEMS[item_id].item_type == ItemType.CHARM for item_id in items_completed)


def prerequisites_are_satisfied(prerequisites_spec: PrerequisiteSpec, items_completed: set[str]) -> bool:
    if isinstance(prerequisites_spec, set):
        return prerequisites_spec.issubset(items_completed)
    if not isinstance(prerequisites_spec, str):
        raise TypeError(f"Unexpected type for prerequisites_spec: {type(prerequisites_spec)}")
    converted_expression = convert_prerequisites_expression(prerequisites_spec)
    try:
        result = eval(converted_expression, globals(), {"re": re, "items_completed": items_completed})
    except Exception as e:
        raise PrerequisiteExpressionError("Failed to evaluate prerequisite expression") from e
    if not isinstance(result, bool):
        raise PrerequisiteExpressionError("prerequisite expression does not evaluate to a boolean")
    return result


def analyze_progress(items_completed: set[str]) -> Progress:
    items_available = set()
    items_blocked = set()
    for item in ALL_PROGRESSION_ITEMS.values():
        if item.id in items_completed:
            continue
        if prerequisites_are_satisfied(item.prerequisites, items_completed):
            items_available.add(item.id)
        else:
            items_blocked.add(item.id)
    return Progress(
        items_completed=items_completed,
        items_available=items_available,
        items_blocked=items_blocked,
    )
