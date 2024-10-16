from typing import Annotated

from fastapi import Depends

from hollowknight_dependencies.db_interface import DbInterface


async def get_db():
    async with DbInterface.managed("progress.db") as db:
        yield db


DbInterfaceDep = Annotated[DbInterface, Depends(get_db)]
