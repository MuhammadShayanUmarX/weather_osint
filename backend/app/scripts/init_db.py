"""Initialize MongoDB collections and indexes.

Run from the backend directory:

    python -m app.scripts.init_db

The operation is idempotent and requires no manual database setup.
"""

from __future__ import annotations

import json

from app.core.database import close_mongo, initialize_database
from app.core.logging import configure_logging
from app.core.config import get_settings


def main() -> None:
    settings = get_settings()
    configure_logging(settings.log_level)
    try:
        summary = initialize_database(settings)
    finally:
        close_mongo()

    print(json.dumps(summary, indent=2, default=str))


if __name__ == "__main__":
    main()
