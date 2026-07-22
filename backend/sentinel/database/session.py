from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sentinel.core.config import settings
from sentinel.database.models.base import Base

# unused imports for table creation
from sentinel.database.models.image import ImageRecord

engine = create_engine(
    url=settings.database_url,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionFactory = sessionmaker(bind=engine)

Base.metadata.create_all(engine)
