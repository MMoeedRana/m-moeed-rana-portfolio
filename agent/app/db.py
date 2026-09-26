from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
from .config import settings

pool = AsyncConnectionPool(
    conninfo=settings.database_url,
    open=False,
    min_size=1,
    max_size=5,
    timeout=10,
    max_lifetime=1800,
    kwargs={
        "row_factory": dict_row,
        "prepare_threshold": None,
        "connect_timeout": 10,
    },
)

async def q(sql: str, params=None) -> list[dict]:
    async with pool.connection() as c:
        cur = await c.execute(sql, params)
        return await cur.fetchall() if cur.description else []
