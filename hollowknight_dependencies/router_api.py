from fastapi import APIRouter

from hollowknight_dependencies.api_deps import DbInterfaceDep
from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS, AllProgressionItemsType, Progress
from hollowknight_dependencies.prerequisites import analyze_progress

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/all-item-definitions")
async def get_all_item_definitions() -> AllProgressionItemsType:
    return ALL_PROGRESSION_ITEMS


@router.get("/current-progress")
async def get_current_progress(db: DbInterfaceDep) -> Progress:
    items_completed = await db.query_completed_progress_items()
    return analyze_progress(items_completed)


@router.post("/mark-item-completed")
async def mark_item_completed(progress_item_id: str, db: DbInterfaceDep) -> Progress:
    items_completed = await db.mark_progress_item_completed(progress_item_id)
    return analyze_progress(items_completed)


@router.post("/reset")
async def reset(db: DbInterfaceDep) -> Progress:
    await db.reset_all_progress()
    return analyze_progress(set())
