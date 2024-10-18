import re

from pytest_subtests.plugin import SubTests

from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS


class TestAllProgressionItemsYaml:
    def test_item_ids(self, subtests: SubTests):
        defined_ids = set(ALL_PROGRESSION_ITEMS.keys())
        defined_ids.add("simple-key")
        for item in ALL_PROGRESSION_ITEMS.values():
            with subtests.test(msg=item.id):
                if isinstance(item.prerequisites, set):
                    referenced_ids = item.prerequisites
                elif isinstance(item.prerequisites, str):
                    prerequisites_string = item.prerequisites
                    assert prerequisites_string.count("`") % 2 == 0, "prerequisites strings must have an even number of backticks (`)"
                    referenced_ids = set(re.findall(r"`([^`]*)`", prerequisites_string))
                else:
                    raise TypeError(f"Unknown type for field `prerequisites`: {type(item.prerequisites)}")
                unknown_ids = referenced_ids - defined_ids
                assert unknown_ids == set(), "prerequisites reference at least one unknown item ID"
