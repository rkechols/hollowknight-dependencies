from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, status as http_status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from hollowknight_dependencies.api_deps import get_db
from hollowknight_dependencies.db_interface import ItemNotDefinedError, PrerequisiteViolationError
from hollowknight_dependencies.router_api import router as router_api


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with asynccontextmanager(get_db)() as db:
        await db.initialize_database()
    yield


api = FastAPI(lifespan=lifespan)


def _error_response(status_code: int, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error_type": type(exc).__name__,
            "error_message": str(exc),
        },
    )


@api.exception_handler(ItemNotDefinedError)
async def handle_db_item_not_defined_error(_, exc: ItemNotDefinedError):
    return _error_response(http_status.HTTP_404_NOT_FOUND, exc)


@api.exception_handler(PrerequisiteViolationError)
async def handle_db_prerequisite_violation_error(_, exc: PrerequisiteViolationError):
    return _error_response(http_status.HTTP_409_CONFLICT, exc)


@api.exception_handler(Exception)
async def handle_any_error(_, exc: Exception):
    return _error_response(http_status.HTTP_500_INTERNAL_SERVER_ERROR, exc)


api.include_router(router_api)


# serve user-facing app files
api.mount("/app", StaticFiles(directory=Path("client/dist")), name="static")
# set up redirects to the user-facing homepage
_app_homepage = RedirectResponse(url="/app/index.html")
for _path_to_app in ("/", "/app"):

    @api.get(_path_to_app, tags=["app"])
    async def get_app() -> RedirectResponse:
        return _app_homepage


def run_dev():
    import uvicorn

    uvicorn.run("hollowknight_dependencies.server:api", host="0.0.0.0", port=8000, reload=True, reload_includes="client/dist/")


if __name__ == "__main__":
    run_dev()
