from logging.config import fileConfig
from sqlalchemy import pool
from alembic import context

from backend.db.database import Base, sync_engine
from backend.db import models  # IMPORTANT: load all models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# =========================
# OFFLINE MIGRATIONS
# =========================
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# =========================
# ONLINE MIGRATIONS (FIXED)
# =========================
def run_migrations_online():
    with sync_engine.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# =========================
# RUN
# =========================
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()