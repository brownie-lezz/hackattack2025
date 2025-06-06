from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime
import requests
from dotenv import load_dotenv
import base64
import PyPDF2
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
import re
import uvicorn
import sys
import traceback
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import shutil
import random
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create necessary directories
os.makedirs("images", exist_ok=True)
os.makedirs("parsed_resumes", exist_ok=True)
os.makedirs("Original_Resumes", exist_ok=True)
os.makedirs("Job_Description", exist_ok=True)

# Mount static files directory
app.mount("/images", StaticFiles(directory="images"), name="images")

# Local Mistral configuration
LOCAL_MISTRAL_URL = "http://localhost:11434/api/generate"  # Default Ollama endpoint

# Initialize prediction_service as None
prediction_service = None

try:
    from ml_model.salary_service import prediction_service
except SyntaxError as e:
    print(f"[WARNING] Could not import prediction_service due to syntax error in careerjet_api_client: {e}")
    print("[WARNING] Similar jobs functionality will be disabled")
except Exception as e:
    print(f"[WARNING] Could not import prediction_service: {e}")
    print("[WARNING] Similar jobs functionality will be disabled")

def call_local_mistral(prompt: str) -> str:
    """Call local Mistral instance through Ollama."""
    try:
        data = {
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            }
        
        response = requests.post(LOCAL_MISTRAL_URL, json=data)
        response.raise_for_status()
        
        # Extract the response text
        result = response.json()
        return result.get("response", "")
        
    except Exception as e:
        print(f"Error calling local Mistral: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling local Mistral: {str(e)}")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using PyPDF2 with OCR fallback."""
    text = ""
    try:
        # First try PyPDF2 extraction
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if not page_text.strip():  # If no text extracted, try OCR for this page
                    try:
                        images = convert_from_path(pdf_path, first_page=page.page_number, last_page=page.page_number)
                        if images:
                            page_text = pytesseract.image_to_string(images[0])
                    except Exception as e:
                        print(f"OCR fallback failed for page {page.page_number}: {str(e)}")
                text += page_text + "\n"
    except Exception as e:
        print(f"PyPDF2 extraction failed: {str(e)}")
        # Fallback to full document OCR
        try:
            images = convert_from_path(pdf_path)
            for image in images:
                text += pytesseract.image_to_string(image) + "\n"
        except Exception as e:
            print(f"PDF image extraction failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
    
    # Save the extracted text to a file in parsed_resumes folder
    try:
        base_filename = os.path.basename(pdf_path)
        parsed_filename = f"pypdf2_{base_filename.replace('.pdf', '.txt')}"
        parsed_path = os.path.join('parsed_resumes', parsed_filename)
        
        # Create parsed_resumes directory if it doesn't exist
        os.makedirs('parsed_resumes', exist_ok=True)
        
        # Save the extracted text with clear formatting
        with open(parsed_path, 'w', encoding='utf-8') as f:
            f.write("=== PyPDF2 Extracted Text ===\n\n")
            f.write(text)
            f.write("\n\n=== End of Extracted Text ===")
        
        print(f"Saved PyPDF2 extracted text to {parsed_path}")
        return text.strip()
    except Exception as e:
        print(f"Error saving extracted text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving extracted text: {str(e)}")

def search_online_profiles(name: str) -> dict:
    """Search for LinkedIn and GitHub profiles based on name."""
    try:
        # Clean the name for searching
        search_name = name.strip().replace(" ", "+")
        
        # Search LinkedIn
        linkedin_url = f"https://www.linkedin.com/search/results/people/?keywords={search_name}"
        
        # Search GitHub
        github_url = f"https://github.com/search?q={search_name}&type=users"
        
        return {
            "linkedIn": {
                "search_url": linkedin_url,
                "status": "unverified"
            },
            "github": {
                "search_url": github_url,
                "status": "unverified"
            }
        }
    except Exception as e:
        print(f"Error searching online profiles: {str(e)}")
        return {
            "linkedIn": {"search_url": "", "status": "error"},
            "github": {"search_url": "", "status": "error"}
        }

def analyze_with_mistral(job_description: str, resume_content: str) -> dict:
    """Analyze a resume against a job description using local Mistral."""
    try:
        print("\n=== Starting Mistral Analysis ===")
        print("Start Time:", datetime.now().strftime("%H:%M:%S"))
        
        # Extract name from resume content
        name_match = re.search(r'(?i)(?:name|full name|candidate):\s*([^\n]+)', resume_content)
        candidate_name = name_match.group(1).strip() if name_match else "Unknown"
        
        # Save the resume content for debugging
        debug_filename = f"resume_content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        debug_path = os.path.join('parsed_resumes', debug_filename)
        
        with open(debug_path, 'w', encoding='utf-8') as f:
            f.write("=== Resume Content ===\n")
            f.write(resume_content)
            f.write("\n\n=== Job Description ===\n")
            f.write(job_description)
        
        print(f"Saved resume content and job description to {debug_path}")

        # Prepare the prompt for Mistral
        prompt = f"""You are an expert resume analyzer. Analyze this resume against the job description and provide a detailed analysis.
        Focus on matching skills, experience, and education requirements.

        Job Description:
        {job_description}

        Resume:
        {resume_content}

        Please analyze the resume and provide a detailed assessment in the following JSON format:
        {{
            "score": <overall match score 0-100, considering all factors>,
            "skills": {{
                "match_score": <skills match score 0-100>,
                "matched_skills": [<list of skills that match the job requirements>],
                "missing_skills": [<list of important skills from job description that are missing in the resume>],
                "skill_summary": "<detailed summary of skills match, highlighting strengths and gaps>"
            }},
            "experience": {{
                "match_score": <experience match score 0-100>,
                "years": <total years of relevant experience>,
                "relevant_experience": [<list of relevant experience areas that match the job>],
                "experience_summary": "<detailed summary of experience match, highlighting relevant roles and achievements>",
                "experience_details": [
                    {{
                        "title": "<job title>",
                        "company": "<company name>",
                        "duration": "<employment duration>",
                        "description": "<detailed description of responsibilities and achievements relevant to the job>"
                    }}
                ]
            }},
            "education": {{
                "match_score": <education match score 0-100>,
                "degree": "<highest degree>",
                "education_summary": "<detailed summary of education match, highlighting relevant coursework and achievements>",
                "education_details": [
                    {{
                        "degree": "<degree name>",
                        "field": "<field of study>",
                        "institution": "<institution name>",
                        "graduation_year": "<year>",
                        "gpa": "<gpa if available>",
                        "relevance": "<explanation of how this education is relevant to the job>"
                    }}
                ]
            }},
            "aiDetection": {{
                "verdict": "<'Likely AI-Generated', 'Possibly AI-Assisted', or 'Human-Written'>",
                "reasoning": "<detailed explanation of why this verdict was reached>"
            }},
            "onlinePresence": {{
                "linkedIn": {{
                    "urls": [<list of LinkedIn profile URLs found in resume>],
                    "status": "<'valid', 'unverified', 'invalid', or 'not found'>",
                    "search_url": "<URL to search for profile if not found in resume>"
                }},
                "github": {{
                    "urls": [<list of GitHub profile URLs found in resume>],
                    "status": "<'valid', 'unverified', 'invalid', or 'not found'>",
                    "search_url": "<URL to search for profile if not found in resume>"
                }},
                "personalWebsites": {{
                    "urls": [<list of personal website URLs found>],
                    "status": "<'valid', 'unverified', 'invalid', or 'not found'>"
                }}
            }}
        }}

        Important guidelines:
        1. Be thorough in identifying matching and missing skills
        2. Consider both technical and soft skills
        3. Evaluate experience relevance and depth
        4. Assess education alignment with job requirements
        5. Provide specific examples and details in summaries
        6. Be honest about gaps and missing qualifications
        7. Consider industry standards and requirements
        8. Score fairly based on actual match with job requirements
        9. Analyze for signs of AI generation (overuse of buzzwords, perfect grammar, repetitive patterns)
        10. Extract and verify online presence URLs
        11. If LinkedIn or GitHub URLs are not found in the resume, set their status to 'not found' and include search URLs
        12. IMPORTANT: Your response must be valid JSON. Do not include any text before or after the JSON object."""

        # Call local Mistral
        analysis_text = call_local_mistral(prompt)
        
        # Save the analysis response for debugging
        analysis_filename = f"analysis_response_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        analysis_path = os.path.join('parsed_resumes', analysis_filename)
        
        with open(analysis_path, 'w', encoding='utf-8') as f:
            f.write(analysis_text)
        
        print(f"Saved analysis response to {analysis_path}")
        
        # Parse the JSON response from Mistral
        try:
            # First, try to find JSON in the response
            json_match = re.search(r'\{[\s\S]*\}', analysis_text)
            if json_match:
                json_str = json_match.group()
                # Clean up the JSON string
                json_str = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', json_str)  # Remove control characters
                json_str = re.sub(r'\\[^"\\\/bfnrtu]', '', json_str)  # Remove invalid escape sequences
                analysis = json.loads(json_str)
            else:
                raise ValueError("No JSON object found in response")
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {str(e)}")
            print(f"Raw response: {analysis_text}")
            # Return a default analysis structure with error information
            return {
                "score": 0,
                "skills": {
                    "match_score": 0,
                    "matched_skills": [],
                    "missing_skills": [],
                    "skill_summary": "Error analyzing skills"
                },
                "experience": {
                    "match_score": 0,
                    "years": 0,
                    "relevant_experience": [],
                    "experience_summary": "Error analyzing experience",
                    "experience_details": []
                },
                "education": {
                    "match_score": 0,
                    "degree": "Unknown",
                    "education_summary": "Error analyzing education",
                    "education_details": []
                },
                "aiDetection": {
                    "verdict": "Not Analyzed",
                    "reasoning": f"Error in analysis: {str(e)}"
                },
                "onlinePresence": {
                    "linkedIn": {"urls": [], "status": "not found", "search_url": ""},
                    "github": {"urls": [], "status": "not found", "search_url": ""},
                    "personalWebsites": {"urls": [], "status": "not found"}
                }
            }

        # If no LinkedIn or GitHub URLs were found, search based on name
        if (not analysis.get('onlinePresence', {}).get('linkedIn', {}).get('urls') or 
            not analysis.get('onlinePresence', {}).get('github', {}).get('urls')):
            search_results = search_online_profiles(candidate_name)
            
            # Update the analysis with search URLs
            if 'onlinePresence' not in analysis:
                analysis['onlinePresence'] = {}
            
            if 'linkedIn' not in analysis['onlinePresence']:
                analysis['onlinePresence']['linkedIn'] = {}
            if 'github' not in analysis['onlinePresence']:
                analysis['onlinePresence']['github'] = {}
            
            # Update LinkedIn search URL if no URLs were found
            if not analysis['onlinePresence']['linkedIn'].get('urls'):
                analysis['onlinePresence']['linkedIn']['search_url'] = search_results['linkedIn']['search_url']
                analysis['onlinePresence']['linkedIn']['status'] = 'not found'
            
            # Update GitHub search URL if no URLs were found
            if not analysis['onlinePresence']['github'].get('urls'):
                analysis['onlinePresence']['github']['search_url'] = search_results['github']['search_url']
                analysis['onlinePresence']['github']['status'] = 'not found'

        return analysis

    except Exception as e:
        print(f"Error in Mistral analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in resume analysis: {str(e)}")

# Load initial data
def load_json_data(filename: str) -> dict:
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Load data
jobs_data = load_json_data('jobs.json')
users_data = load_json_data('users.json')

# Database setup for job descriptions
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
try:
    # Ensure the database directory exists
    os.makedirs(os.path.dirname(SQLALCHEMY_DATABASE_URL.replace('sqlite:///', '')), exist_ok=True)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating database tables: {str(e)}")
    print(f"Error type: {type(e)}")
    print(f"Traceback: {traceback.format_exc()}")

# Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

class ProfileCreate(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    education: Optional[List[dict]] = None
    experience: Optional[List[dict]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    interests: Optional[List[str]] = None

class JobDescriptionCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    workType: str

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

# Models
class User(BaseModel):
    id: str
    username: str
    email: str
    is_employer: bool

class Job(BaseModel):
    id: str
    title: str
    company: str
    description: str
    requirements: List[str]
    location: str
    salary: Optional[str] = None

class JobDescription(BaseModel):
    id: str
    title: str
    description: str
    requirements: List[str]

class ResumeAnalysisRequest(BaseModel):
    jobDescription: str
    resumes: List[dict]

class AnalysisResult(BaseModel):
    id: str
    name: str
    score: float
    skills: dict
    experience: dict
    education: dict

class ChatMessage(BaseModel):
    resume_text: str
    question: str
    analysis: Optional[dict] = None

class QuestionGenerationRequest(BaseModel):
    job_id: str
    num_questions: int
    question_types: List[str]
    job_title: str
    job_description: str
    required_skills: List[str]

# Market Analysis Models
class SalaryPredictionRequest(BaseModel):
    title: str
    location: str
    workType: str
    experienceLevel: str
    industry: str
    skills: List[str]
    education: str
    certification: str
    experience: str
    remote: bool
    companySize: int
    as_monthly: bool

class SimilarJobsRequest(BaseModel):
    title: str
    location: str
    keywords: str
    workType: str

class ChatRequest(BaseModel):
    message: str
    resumes: List[dict]

# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to the API"}

@app.get("/jobs")
async def get_jobs():
    return jobs_data

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    try:
        # Find the job with the given ID
        job = next((job for job in jobs_data if job["id"] == job_id), None)
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users")
async def get_users():
    return users_data

@app.get("/api/job-descriptions")
async def get_job_descriptions():
    try:
        # Load job descriptions from the Job_Description directory
        job_descriptions = []
        job_desc_dir = "Job_Description"
        
        if os.path.exists(job_desc_dir):
            for filename in os.listdir(job_desc_dir):
                if filename.endswith('.txt'):
                    with open(os.path.join(job_desc_dir, filename), 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Create a job description object
                        job_desc = {
                            "id": filename.replace('.txt', ''),
                            "title": filename.replace('.txt', '').replace('_', ' '),
                            "content": content
                        }
                        job_descriptions.append(job_desc)
        
        return job_descriptions
    except Exception as e:
        print(f"Error in get_job_descriptions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/job-descriptions")
async def create_job_description(job: JobDescriptionCreate):
    try:
        job_desc_dir = "Job_Description"
        os.makedirs(job_desc_dir, exist_ok=True)
        
        # Create a filename from the title
        filename = job.title.replace(' ', '_') + '.txt'
        filepath = os.path.join(job_desc_dir, filename)
        
        # Write the content to the file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(job.content)
        
        return {
            "id": filename.replace('.txt', ''),
            "title": job.title,
            "content": job.content
        }
    except Exception as e:
        print(f"Error in create_job_description: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/job-descriptions/{job_id}")
async def delete_job_description(job_id: str):
    try:
        job_desc_dir = "Job_Description"
        filename = job_id + '.txt'
        filepath = os.path.join(job_desc_dir, filename)
        
        if os.path.exists(filepath):
            os.remove(filepath)
            return {"message": "Job description deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Job description not found")
    except Exception as e:
        print(f"Error in delete_job_description: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resumes")
async def get_resumes(path: str = "original", subdir: str = None):
    try:
        print(f"Getting resumes from path: {path}, subdir: {subdir}")
        
        # Determine the base directory
        if path == "original":
            base_dir = "Original_Resumes"
        elif path == "parsed":
            base_dir = "Parsed_Resumes"
        else:
            raise HTTPException(status_code=400, detail="Invalid path parameter")
        
        # If subdir is provided, use it as the full path
        if subdir:
            full_path = os.path.join(base_dir, subdir)
        else:
            full_path = base_dir
            
        print(f"Full path: {full_path}")
        
        if not os.path.exists(full_path):
            print(f"Path does not exist: {full_path}")
            if path == "parsed" and subdir:
                # For parsed files, return empty content if file doesn't exist
                return {"content": "", "type": "text"}
            return []
        
        if os.path.isfile(full_path):
            # If it's a file, return its content
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                return {"content": content, "type": "text"}
            except Exception as e:
                print(f"Error reading file {full_path}: {str(e)}")
                return {"content": "", "type": "text"}

        # If it's a directory, list its contents
        items = []
        for item in os.listdir(full_path):
            item_path = os.path.join(full_path, item)
            is_dir = os.path.isdir(item_path)
            
            items.append({
                "name": item,
                "type": "directory" if is_dir else "file",
                "path": item_path
            })
            
        print(f"Found {len(items)} items")
        return items
    except Exception as e:
        print(f"Error getting resumes: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring backend status."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    )

def clean_parsed_resumes_folder():
    """Clean the parsed_resumes folder by removing all analysis files."""
    try:
        parsed_resumes_dir = "parsed_resumes"
        if not os.path.exists(parsed_resumes_dir):
            os.makedirs(parsed_resumes_dir)
            return

        # Get all files in the directory
        for filename in os.listdir(parsed_resumes_dir):
            if filename.startswith(("resume_content_", "analysis_response_", "pypdf2_")):
                file_path = os.path.join(parsed_resumes_dir, filename)
                try:
                    os.remove(file_path)
                    print(f"Deleted file: {file_path}")
                except Exception as e:
                    print(f"Error deleting file {file_path}: {str(e)}")

        print("Cleaned parsed_resumes folder")
    except Exception as e:
        print(f"Error cleaning parsed_resumes folder: {str(e)}")

@app.post("/api/analyze-resumes")
async def analyze_resumes(request: ResumeAnalysisRequest):
    try:
        print(f"Received analysis request for {len(request.resumes)} resumes")
        print(f"Job description length: {len(request.jobDescription)}")
        
        # Clean the parsed_resumes folder before starting new analysis
        clean_parsed_resumes_folder()
        
        results = []
        for resume in request.resumes:
            print(f"Analyzing resume: {resume['name']}")
            
            try:
                # Get the resume path
                resume_path = os.path.join("Original_Resumes", resume["path"])
                
                # Check if it's a directory
                if os.path.isdir(resume_path):
                    print(f"Found directory: {resume_path}")
                    # Scan directory for PDF files
                    pdf_files = []
                    for file in os.listdir(resume_path):
                        if file.lower().endswith('.pdf'):
                            pdf_files.append(os.path.join(resume_path, file))
                    
                    if not pdf_files:
                        print(f"No PDF files found in directory: {resume_path}")
                        results.append({
                            "id": resume["id"],
                            "name": resume["name"],
                            "error": "No PDF files found in directory"
                        })
                        continue
                    
                    # Analyze each PDF file in the directory
                    for pdf_file in pdf_files:
                        try:
                            print(f"Processing PDF file: {pdf_file}")
                            # Extract text from PDF using Mistral
                            resume_content = extract_text_from_pdf(pdf_file)
                            print(f"Successfully extracted text from {os.path.basename(pdf_file)}")
                            
                            # Analyze the resume using Mistral
                            analysis = analyze_with_mistral(request.jobDescription, resume_content)
                            
                            # Add resume metadata to the analysis
                            analysis["id"] = f"{resume['id']}_{os.path.basename(pdf_file)}"
                            analysis["name"] = os.path.basename(pdf_file)
                            
                            # Log the analysis results for debugging
                            print(f"Analysis results for {os.path.basename(pdf_file)}:")
                            print(f"Overall score: {analysis['score']}")
                            print(f"Skills match: {analysis['skills']['match_score']}")
                            print(f"Experience match: {analysis['experience']['match_score']}")
                            print(f"Education match: {analysis['education']['match_score']}")
                            print(f"AI Detection: {analysis.get('aiDetection', {}).get('verdict', 'Not Analyzed')}")
                            print(f"Online Presence: {analysis.get('onlinePresence', {})}")
                            
                            results.append(analysis)
                        except Exception as e:
                            print(f"Error analyzing PDF file {pdf_file}: {str(e)}")
                            results.append({
                                "id": f"{resume['id']}_{os.path.basename(pdf_file)}",
                                "name": os.path.basename(pdf_file),
                                "error": str(e)
                            })
                else:
                    # Handle single file
                    try:
                        # Extract text from PDF using Mistral
                        resume_content = extract_text_from_pdf(resume_path)
                        print(f"Successfully extracted text from {resume['name']}")
                        
                        # Analyze the resume using Mistral
                        analysis = analyze_with_mistral(request.jobDescription, resume_content)
                        
                        # Add resume metadata to the analysis
                        analysis["id"] = resume["id"]
                        analysis["name"] = resume["name"]
                        
                        # Log the analysis results for debugging
                        print(f"Analysis results for {resume['name']}:")
                        print(f"Overall score: {analysis['score']}")
                        print(f"Skills match: {analysis['skills']['match_score']}")
                        print(f"Experience match: {analysis['experience']['match_score']}")
                        print(f"Education match: {analysis['education']['match_score']}")
                        print(f"AI Detection: {analysis.get('aiDetection', {}).get('verdict', 'Not Analyzed')}")
                        print(f"Online Presence: {analysis.get('onlinePresence', {})}")
                        
                        results.append(analysis)
                    except Exception as e:
                        print(f"Error analyzing resume {resume['name']}: {str(e)}")
                        results.append({
                            "id": resume["id"],
                            "name": resume["name"],
                            "error": str(e)
                        })
            except Exception as e:
                print(f"Error processing resume {resume['name']}: {str(e)}")
                results.append({
                    "id": resume["id"],
                    "name": resume["name"],
                    "error": str(e)
                })
        
        return results
    except Exception as e:
        print(f"Error in analyze_resumes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print(f"Received chat request with message: {request.message}")
        print(f"Number of resumes: {len(request.resumes)}")
        
        # Get parsed resumes
        parsed_resumes = []
        for resume in request.resumes:
            if resume and resume.get('name'):
                # Convert original filename to parsed filename
                parsed_filename = f"pypdf2_{resume['name'].replace('.pdf', '.txt')}"
                parsed_path = os.path.join("Parsed_Resumes", parsed_filename)
                
                if os.path.exists(parsed_path):
                    try:
                        with open(parsed_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            parsed_resumes.append({
                                "name": resume['name'],
                                "content": content
                            })
                    except Exception as e:
                        print(f"Error reading parsed resume {parsed_path}: {str(e)}")
                        continue
        
        if not parsed_resumes:
            return {"response": "I couldn't find any parsed resume content to analyze. Please make sure the resumes have been processed."}
        
        # Prepare the prompt for Mistral
        prompt = f"""Based on the following resume contents, please answer this question: {request.message}

Resume Contents:
"""
        for resume in parsed_resumes:
            prompt += f"\n=== Resume: {resume['name']} ===\n{resume['content']}\n"

        # Call local Mistral
        try:
            response = call_local_mistral(prompt)
            return {"response": response}
        except Exception as e:
            print(f"Error calling local Mistral: {str(e)}")
            return {"response": "I apologize, but I encountered an error while processing your request. Please try again."}
            
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    try:
        print(f"Received question generation request for job: {request.job_title}")
        print(f"Number of questions requested: {request.num_questions}")
        print(f"Question types: {request.question_types}")
        
        # Define question templates based on job type
        technical_questions = [
            {
                "question": f"Can you walk me through your experience with {skill}?",
                "type": "technical",
                "focus": "technical expertise"
            } for skill in request.required_skills[:2]  # Use first 2 required skills
        ]
        
        behavioral_questions = [
            {
                "question": "Tell me about a challenging project you worked on and how you handled it.",
                "type": "behavioral",
                "focus": "problem-solving and project management"
            },
            {
                "question": "Describe a situation where you had to work with a difficult team member.",
                "type": "behavioral",
                "focus": "teamwork and conflict resolution"
            }
        ]
        
        situational_questions = [
            {
                "question": f"How would you approach a situation where you need to implement {request.required_skills[0]} in a tight deadline?",
                "type": "situational",
                "focus": "time management and technical implementation"
            },
            {
                "question": "What would you do if you discovered a critical bug in production?",
                "type": "situational",
                "focus": "crisis management and debugging"
            }
        ]
        
        # Combine questions based on requested types
        all_questions = []
        if "technical" in request.question_types:
            all_questions.extend(technical_questions)
        if "behavioral" in request.question_types:
            all_questions.extend(behavioral_questions)
        if "situational" in request.question_types:
            all_questions.extend(situational_questions)
            
        # Ensure we have enough questions
        while len(all_questions) < request.num_questions:
            all_questions.extend([
                {
                    "question": "Tell me about yourself and your experience.",
                    "type": "behavioral",
                    "focus": "self-introduction and experience overview"
                },
                {
                    "question": "What are your greatest strengths?",
                    "type": "behavioral",
                    "focus": "self-awareness and key competencies"
                },
                {
                    "question": "Why do you want to work for this company?",
                    "type": "situational",
                    "focus": "motivation and company fit"
                }
            ])
            
        # Return only the requested number of questions
        return {
            "questions": all_questions[:request.num_questions]
        }
            
    except Exception as e:
        print(f"Error in generate_questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/favicon.ico')
async def favicon():
    return FileResponse('favicon.ico')

@app.get('/images/{filename}')
async def serve_image(filename: str):
    return FileResponse(f'images/{filename}')

@app.get('/')
async def index():
    return {"message": "Welcome to the API"}

@app.options('/{path:path}')
async def handle_options(path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

@app.get('/api/test')
async def test_endpoint():
    return {"message": "Test endpoint working"}

@app.post("/api/jobs/salary-prediction")
async def predict_salary(request: SalaryPredictionRequest):
    try:
        # Prepare the prompt for Mistral
        prompt = f"""Analyze this job posting and predict a reasonable salary range.
        Job Title: {request.title}
        Location: {request.location}
        Work Type: {request.workType}
        Experience Level: {request.experienceLevel}
        Industry: {request.industry}
        Required Skills: {', '.join(request.skills)}
        Education: {request.education}
        Certification: {request.certification}
        Experience Required: {request.experience}
        Remote: {request.remote}
        Company Size: {request.companySize}

        Please provide a salary prediction in the following JSON format:
        {{
            "success": true,
            "monthly": "<formatted monthly salary range>",
            "salaryValue": <numeric value in thousands>,
            "confidence": <confidence score 0-100>,
            "factors": [
                "<factor affecting salary>",
                ...
            ]
        }}"""

        # Call local Mistral
        response = call_local_mistral(prompt)
        
        # Parse the response
        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # Fallback to default values if parsing fails
            return {
                "success": True,
                "monthly": "$6,000 - $8,000",
                "salaryValue": 7,
                "confidence": 70,
                "factors": [
                    "Market average for similar positions",
                    "Required skills and experience",
                    "Location and remote work options"
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/similar-jobs")
async def get_similar_jobs(request: SimilarJobsRequest):
    if prediction_service is None:
        raise HTTPException(
            status_code=503,
            detail="Similar jobs service is currently unavailable. Please try again later."
        )
    
    try:
        job_data = {
            "title": request.title,
            "location": request.location,
            "keywords": request.keywords,
            "workType": request.workType
        }
        similar_jobs = prediction_service.get_similar_jobs(job_data)
        return similar_jobs
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        print(f"Received file upload request: {file.filename}")
        
        # Create the upload directory if it doesn't exist
        upload_dir = "Original_Resumes"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Clean the filename
        filename = file.filename.replace(' ', '_')
        file_path = os.path.join(upload_dir, filename)
        
        print(f"Saving file to: {file_path}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        print(f"File saved successfully: {file_path}")
        return {"message": "File uploaded successfully", "filename": filename}
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resumes/folders")
async def create_folder(request: dict):
    try:
        folder_name = request.get("name")
        parent_id = request.get("parentId", "")
        
        if not folder_name:
            raise HTTPException(status_code=400, detail="Folder name is required")
        
        # Create the base directory if it doesn't exist
        base_dir = "Original_Resumes"
        os.makedirs(base_dir, exist_ok=True)
        
        # Create the full path
        if parent_id:
            folder_path = os.path.join(base_dir, parent_id, folder_name)
        else:
            folder_path = os.path.join(base_dir, folder_name)
        
        # Create the folder
        os.makedirs(folder_path, exist_ok=True)
        
        return {"message": "Folder created successfully", "path": folder_path}
    except Exception as e:
        print(f"Error creating folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/resumes/{resume_id}")
async def delete_resume(resume_id: str):
    try:
        # Construct the full path
        file_path = os.path.join("Original_Resumes", resume_id)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File or directory not found")
        
        # Delete the file or directory
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        
        return {"message": "Item deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error deleting item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resumes/{resume_id}/download")
async def download_resume(resume_id: str):
    try:
        # Construct the full path
        file_path = os.path.join("Original_Resumes", resume_id)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if os.path.isdir(file_path):
            raise HTTPException(status_code=400, detail="Cannot download a directory")
        
        # Return the file
        return FileResponse(
            file_path,
            media_type="application/octet-stream",
            filename=os.path.basename(file_path)
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/profiles")
async def create_profile(profile: ProfileCreate):
    try:
        # First check if user exists
        user_query = "SELECT id FROM users WHERE id = $1"
        user = await database.fetch_one(user_query, profile.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if profile already exists
        existing_profile = await database.fetch_one(
            "SELECT * FROM profiles WHERE id = $1",
            profile.id
        )

        if existing_profile:
            # Update existing profile
            query = """
                UPDATE profiles 
                SET full_name = $1, 
                    email = $2, 
                    phone = $3, 
                    address = $4, 
                    education = $5, 
                    experience = $6, 
                    skills = $7, 
                    certifications = $8, 
                    languages = $9, 
                    interests = $10, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $11
                RETURNING *
            """
            values = (
                profile.full_name,
                profile.email,
                profile.phone,
                profile.address,
                profile.education,
                profile.experience,
                profile.skills,
                profile.certifications,
                profile.languages,
                profile.interests,
                profile.id
            )
        else:
            # Create new profile
            query = """
                INSERT INTO profiles (
                    id, full_name, email, phone, address, 
                    education, experience, skills, certifications, 
                    languages, interests, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
                RETURNING *
            """
            values = (
                profile.id,
                profile.full_name,
                profile.email,
                profile.phone,
                profile.address,
                profile.education,
                profile.experience,
                profile.skills,
                profile.certifications,
                profile.languages,
                profile.interests
            )

        result = await database.fetch_one(query, *values)
        return dict(result)
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error in create_profile: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

# Add this function before the ML module imports
async def create_mock_jobs():
    try:
        # Mock job data
        mock_jobs = [
            {
                "title": "Senior Software Engineer",
                "description": "We are looking for a Senior Software Engineer to join our team. The ideal candidate will have experience in full-stack development and a passion for creating scalable applications.",
                "required_skills": ["Python", "JavaScript", "React", "Node.js", "AWS"],
                "company_name": "Tech Innovators Inc",
                "location": "San Francisco, CA",
                "salary_range": "$120,000 - $180,000",
                "job_type": "Full-time",
                "created_at": datetime.now()
            },
            {
                "title": "Data Scientist",
                "description": "Join our data science team to work on cutting-edge machine learning projects. You'll be responsible for developing and implementing ML models to solve complex business problems.",
                "required_skills": ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
                "company_name": "Data Dynamics",
                "location": "New York, NY",
                "salary_range": "$100,000 - $150,000",
                "job_type": "Full-time",
                "created_at": datetime.now()
            },
            {
                "title": "Frontend Developer",
                "description": "We're seeking a Frontend Developer to create beautiful and responsive user interfaces. Experience with modern JavaScript frameworks is required.",
                "required_skills": ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
                "company_name": "Web Solutions Ltd",
                "location": "Remote",
                "salary_range": "$80,000 - $120,000",
                "job_type": "Full-time",
                "created_at": datetime.now()
            },
            {
                "title": "DevOps Engineer",
                "description": "Looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. Experience with containerization and CI/CD is essential.",
                "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
                "company_name": "Cloud Systems",
                "location": "Seattle, WA",
                "salary_range": "$110,000 - $160,000",
                "job_type": "Full-time",
                "created_at": datetime.now()
            },
            {
                "title": "Product Manager",
                "description": "Join our product team to drive the development of innovative software solutions. You'll work closely with engineering and design teams to deliver great products.",
                "required_skills": ["Product Management", "Agile", "User Research", "Data Analysis", "Communication"],
                "company_name": "Product Pro",
                "location": "Austin, TX",
                "salary_range": "$90,000 - $140,000",
                "job_type": "Full-time",
                "created_at": datetime.now()
            }
        ]

        # Insert mock jobs
        for job in mock_jobs:
            query = """
                INSERT INTO jobs (
                    title, description, required_skills, company_name,
                    location, salary_range, job_type, created_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                )
            """
            values = (
                job["title"],
                job["description"],
                job["required_skills"],
                job["company_name"],
                job["location"],
                job["salary_range"],
                job["job_type"],
                job["created_at"]
            )
            await database.execute(query, *values)

        return {"message": "Mock jobs created successfully"}
    except Exception as e:
        print(f"Error creating mock jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add this route
@app.post("/api/create-mock-jobs")
async def create_mock_jobs_endpoint():
    return await create_mock_jobs()

try:
    # Try to import ML modules
    from job_routes import router as job_router
    from salary_prediction_service import router as salary_router
    # Attempt to import prediction_service. If this fails, 
    # routes relying on it will fail at runtime or blueprint registration might be affected.
    from ml_model.salary_service import prediction_service 
    
    # Include the routers
    app.include_router(job_router)
    app.include_router(salary_router)
    # If we reach here, critical imports and blueprint registrations were successful.
except ImportError as e:
    # Critical modules failed to import. The application might be in a non-operational state.
    # Consider raising the error or exiting if these are essential for all operations.
    print(f"[CRITICAL SETUP ERROR] Failed to import essential ML modules or blueprints: {e}")
    # To allow server to start for basic checks, we pass. But functionalities will be broken.
    pass 
except Exception as e:
    print(f"[CRITICAL SETUP ERROR] An unexpected error occurred during ML/blueprint initialization: {e}")
    pass

if __name__ == '__main__':
    # Start the server
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8000))
    app.run(host=host, port=port, debug=False)
