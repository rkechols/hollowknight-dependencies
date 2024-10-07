from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, status as http_status
from fastapi.responses import JSONResponse

from hollowknight_dependencies.db_interface import DbInterface, ItemNotDefinedError, PrerequisiteViolationError
from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS, AllProgressionItemsType, Progress
from hollowknight_dependencies.prerequisites import analyze_progress


async def get_db():
    async with DbInterface.managed("progress.db") as db:
        yield db


DbInterfaceDep = Annotated[DbInterface, Depends(get_db)]


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with asynccontextmanager(get_db)() as db:
        await db.initialize_database()
    yield


api = FastAPI(lifespan=lifespan)


@api.exception_handler(ItemNotDefinedError)
async def handle_db_item_not_defined_error(_, exc: ItemNotDefinedError):
    return JSONResponse(
        status_code=http_status.HTTP_404_NOT_FOUND,
        content={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
        },
    )


@api.exception_handler(PrerequisiteViolationError)
async def handle_db_prerequisite_violation_error(_, exc: PrerequisiteViolationError):
    return JSONResponse(
        status_code=http_status.HTTP_409_CONFLICT,
        content={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
        },
    )


@api.get("/")
async def get_root():
    return {"service": "hollowknight-dependencies"}


@api.get("/all-item-definitions")
async def get_all_item_definitions() -> AllProgressionItemsType:
    return ALL_PROGRESSION_ITEMS


@api.get("/current-progress")
async def get_current_progress(db: DbInterfaceDep) -> Progress:
    items_completed = await db.query_completed_progress_items()
    return analyze_progress(items_completed)


@api.post("/mark-item-completed")
async def mark_item_completed(progress_item_id: str, db: DbInterfaceDep) -> Progress:
    items_completed = await db.mark_progress_item_completed(progress_item_id)
    return analyze_progress(items_completed)


@api.post("/reset")
async def reset(db: DbInterfaceDep) -> Progress:
    await db.reset_all_progress()
    return analyze_progress(set())


def run_dev():
    import uvicorn

    uvicorn.run("hollowknight_dependencies.server:api", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    run_dev()
