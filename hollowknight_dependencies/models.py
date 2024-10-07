from pathlib import Path
from typing import Annotated

import yaml
from pydantic import AfterValidator, BaseModel, RootModel


class ProgressionItem(BaseModel):
    id: str
    display_name: str
    geo_cost: int | None = None
    prerequisites: set[str]  # IDs of other ProgressionItems


AllProgressionItemsType = dict[str, ProgressionItem]


def _check_ids(all_items: AllProgressionItemsType) -> AllProgressionItemsType:
    missing_ids = set()
    for item in all_items.values():
        for prerequisite_id in item.prerequisites:
            if prerequisite_id not in all_items.keys():
                missing_ids.add(prerequisite_id)
    if len(missing_ids) > 0:
        raise ValueError(f"item IDs used as prerequisites, but no matching item declarations were found: {sorted(missing_ids)}")
    return all_items


_AllProgressionItems = RootModel[Annotated[AllProgressionItemsType, AfterValidator(_check_ids)]]

with open(Path(__file__).parent / "all-progression-items.yaml", "r", encoding="utf-8") as f_:
    _all_progression_items = yaml.safe_load(f_)
for id_, obj_ in _all_progression_items.items():
    obj_["id"] = id_
ALL_PROGRESSION_ITEMS = _AllProgressionItems.model_validate(_all_progression_items).root


class Progress(BaseModel):
    completed_items: set[str]
