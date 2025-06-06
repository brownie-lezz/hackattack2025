from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./job_descriptions.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class JobDescriptionCreate(BaseModel):
    title: str
    content: str

class JobDescriptionResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/job-descriptions", response_model=List[JobDescriptionResponse])
def get_job_descriptions():
    try:
        db = SessionLocal()
        job_descriptions = db.query(JobDescription).all()
        return job_descriptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/job-descriptions", response_model=JobDescriptionResponse)
def create_job_description(job: JobDescriptionCreate):
    try:
        db = SessionLocal()
        new_job = JobDescription(
            title=job.title,
            content=job.content
        )
        db.add(new_job)
        db.commit()
        db.refresh(new_job)
        return new_job
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/job-descriptions/{job_id}")
def delete_job_description(job_id: int):
    try:
        db = SessionLocal()
        job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job description not found")
        db.delete(job)
        db.commit()
        return {"message": "Job description deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 