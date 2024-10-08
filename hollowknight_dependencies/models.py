import itertools
from enum import StrEnum
from pathlib import Path
from typing import Self

import yaml
from pydantic import BaseModel, RootModel, model_validator

PrerequisiteSpec = set[str] | str


class ItemType(StrEnum):
    ABILITY = "Ability"
    BOSS = "Boss"
    CHARM = "Charm"
    EXPENDABLE = "Expendable"
    MAP = "Map"
    PATH = "Path"
    SHOP = "Shop"
    SIMPLE_KEY = "Simple Key"
    SINGLETON = "Singleton"
    STAG_STATION = "Stag Station"
    UPGRADE = "Upgrade"


class ProgressionItem(BaseModel, frozen=True):
    id: str
    display_name: str
    item_type: ItemType
    geo_cost: int | None = None
    prerequisites: PrerequisiteSpec


AllProgressionItemsType = dict[str, ProgressionItem]


with open(Path(__file__).parent / "all-progression-items.yaml", "r", encoding="utf-8") as f_:
    _all_progression_items = yaml.safe_load(f_)
for id_, obj_ in _all_progression_items.items():
    obj_["id"] = id_
ALL_PROGRESSION_ITEMS = RootModel[AllProgressionItemsType].model_validate(_all_progression_items).root


class Progress(BaseModel):
    items_completed: set[str]
    items_available: set[str]
    items_blocked: set[str]

    @model_validator(mode="after")
    def validate_completeness(self) -> Self:
        all_ids = set(ALL_PROGRESSION_ITEMS.keys())
        # check that no items are left out, and that none are extraneous/undefined
        union = self.items_completed | self.items_available | self.items_blocked
        if len(missing := all_ids - union) > 0:
            raise ValueError(f"`Progress` should partition item IDs; some IDs are missing: {sorted(missing)}")
        elif len(extra := union - all_ids) > 0:
            raise ValueError(f"`Progress` should partition item IDs; some extra IDs were listed: {sorted(extra)}")
        # else: all IDs are listed
        # check that no items are in multiple sets
        duplicated = set()
        for set1, set2 in itertools.combinations((self.items_completed, self.items_available, self.items_blocked), 2):
            duplicated.update(set1 & set2)
        if len(duplicated) > 0:
            raise ValueError(f"`Progress` should partition item IDs; some IDs were duplicated: {sorted(duplicated)}")
        return self


if __name__ == "__main__":
    from pprint import pprint

    pprint(ALL_PROGRESSION_ITEMS)
