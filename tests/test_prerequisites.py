import pytest

from hollowknight_dependencies.prerequisites import PrerequisiteExpressionError, prerequisites_are_satisfied

ITEM_A = "item-a"
ITEM_B = "item-b"
ITEM_C = "item-c"
ITEM_D = "item-d"

ALL_ITEMS = {ITEM_A, ITEM_B, ITEM_C, ITEM_D}


class TestPrerequisitesAreSatisfied:
    @pytest.mark.parametrize("subset", [set(), {ITEM_B}, {ITEM_B, ITEM_C}, ALL_ITEMS])
    def test_set_subset(self, subset: set[str]):
        assert prerequisites_are_satisfied(subset, ALL_ITEMS)

    @pytest.mark.parametrize("strict_subset", [set(), {ITEM_B}, {ITEM_B, ITEM_C}])
    def test_set_strict_superset(self, strict_subset: set[str]):
        assert not prerequisites_are_satisfied(ALL_ITEMS, strict_subset)

    def test_set_both_empty(self):
        assert prerequisites_are_satisfied(set(), set())

    @pytest.mark.parametrize("items_completed", [{ITEM_C}, {ITEM_A, ITEM_C}, {ITEM_A, ITEM_B}, {ITEM_A, ITEM_B, ITEM_D}])
    def test_eval_complicated_positive(self, items_completed: set[str]):
        assert prerequisites_are_satisfied(
            f"(`{ITEM_A}` && `{ITEM_B}`) || (`{ITEM_C}` && !`{ITEM_D}`)",
            items_completed,
        )

    @pytest.mark.parametrize("items_completed", [set(), {ITEM_C, ITEM_D}, {ITEM_A}])
    def test_eval_complicated_negative(self, items_completed: set[str]):
        assert not prerequisites_are_satisfied(
            f"(`{ITEM_A}` && `{ITEM_B}`) || (`{ITEM_C}` && !`{ITEM_D}`)",
            items_completed,
        )

    @pytest.mark.parametrize("expression", ["2 + 2 == 4", "True", "'a' in 'cat'"])
    def test_eval_normal_python_positive(self, expression: str):
        assert prerequisites_are_satisfied(expression, ALL_ITEMS)

    @pytest.mark.parametrize("expression", ["2 + 2 == 5", "False", "'x' in 'cat'"])
    def test_eval_normal_python_negative(self, expression: str):
        assert not prerequisites_are_satisfied(expression, ALL_ITEMS)

    @pytest.mark.parametrize("bad_expression", [repr(ITEM_A), "42", "None"])
    def test_eval_normal_python_not_bool(self, bad_expression: str):
        with pytest.raises(PrerequisiteExpressionError):
            prerequisites_are_satisfied(bad_expression, ALL_ITEMS)

    @pytest.mark.parametrize("bad_expression", ["", "does_not_exist", "(", "bool(prerequisites_spec)"])
    def test_eval_bad_expression(self, bad_expression: str):
        with pytest.raises(PrerequisiteExpressionError):
            prerequisites_are_satisfied(bad_expression, ALL_ITEMS)

    def test_prerequisites_spec_bad_type(self):
        with pytest.raises(TypeError):
            prerequisites_are_satisfied([ITEM_A, ITEM_B], ALL_ITEMS)
