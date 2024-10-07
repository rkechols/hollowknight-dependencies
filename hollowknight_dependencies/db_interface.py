from contextlib import asynccontextmanager
from pathlib import Path
from typing import Self

import aiofiles
import aiosqlite

from hollowknight_dependencies.models import ALL_PROGRESSION_ITEMS
from hollowknight_dependencies.prerequisites import prerequisites_are_satisfied


class ItemNotDefinedError(ValueError):
    """raised when an unknown item is referenced"""


class PrerequisiteViolationError(Exception):
    """raised when an action does not follow defined prerequisite rules"""


class DbInterface:
    @classmethod
    @asynccontextmanager
    async def managed(cls, database: str | Path) -> Self:
        async with aiosqlite.connect(database, autocommit=False) as db:
            db.row_factory = aiosqlite.Row
            yield DbInterface(db)

    def __init__(self, db_connection: aiosqlite.Connection):
        super().__init__()
        self.conn = db_connection

    async def initialize_database(self):
        async with aiofiles.open(Path(__file__).parent / "init_db.sql", "r", encoding="utf-8") as f:
            script = await f.read()
        await self.conn.execute(script)
        await self.conn.commit()

    async def query_completed_progress_items(self) -> set[str]:
        async with self.conn.execute("SELECT id FROM progress_item_completed") as cursor:
            rows = await cursor.fetchall()
            return {row["id"] for row in rows}

    async def mark_progress_item_completed(self, progress_item_id: str) -> set[str]:
        # get the item definition
        try:
            progress_item = ALL_PROGRESSION_ITEMS[progress_item_id]
        except KeyError as e:
            raise ItemNotDefinedError(f"progress_item_id not defined: {progress_item_id!r}") from e
        # check if its prerequisites are complete
        completed_items = await self.query_completed_progress_items()
        if progress_item_id in completed_items:
            # already completed, no action needed
            return completed_items
        if not prerequisites_are_satisfied(progress_item, completed_items):
            raise PrerequisiteViolationError(f"{progress_item_id=} has unmet prerequisites")
        # mark it as completed
        await self.conn.execute("INSERT INTO progress_item_completed (id) VALUES (?)", [progress_item_id])
        await self.conn.commit()
        # return an updated list of completed items
        await self.query_completed_progress_items()

    async def reset_all_progress(self):
        await self.conn.execute("DELETE FROM progress_item_completed")
        await self.conn.commit()
