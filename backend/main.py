from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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

# Local Mistral configuration
LOCAL_MISTRAL_URL = "http://localhost:11434/api/generate"  # Default Ollama endpoint

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

# Routes
@app.get("/")
async def read_root():
    return {"message": "Welcome to TalentVerse API"}

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
                            "description": content,
                            "requirements": []  # You might want to parse requirements from the content
                        }
                        job_descriptions.append(job_desc)
        
        return job_descriptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resumes")
async def get_resumes(path: str = Query(None), subdir: str = Query(None)):
    try:
        # Determine which directory to use
        base_dir = "parsed_resumes" if path == "parsed" else "Original_Resumes"
        
        if not os.path.exists(base_dir):
            os.makedirs(base_dir, exist_ok=True)
            return []
        
        # If subdir is specified, use it as the target directory
        if subdir:
            # Clean the subdir path to prevent directory traversal
            subdir = os.path.normpath(subdir).lstrip(os.sep)
            target_dir = os.path.join(base_dir, subdir)
            
            # If it's a file, return its content
            if os.path.isfile(target_dir):
                try:
                    if target_dir.lower().endswith('.pdf'):
                        content = extract_text_from_pdf(target_dir)
                    else:
                        with open(target_dir, 'r', encoding='utf-8') as f:
                            content = f.read()
                    return {"content": content}
                except Exception as e:
                    print(f"Error reading file {target_dir}: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
            
            # If it's a directory, scan it
            if os.path.isdir(target_dir):
                items = []
                for item in os.listdir(target_dir):
                    item_path = os.path.join(target_dir, item)
                    relative_path = os.path.relpath(item_path, base_dir)
                    
                    if os.path.isdir(item_path):
                        items.append({
                            "id": relative_path,
                            "name": item,
                            "type": "directory",
                            "path": relative_path,
                            "uploadDate": datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat(),
                            "items": scan_directory(item_path)
                        })
                    elif item.lower().endswith(('.pdf', '.doc', '.docx', '.txt')):
                        try:
                            file_stats = os.stat(item_path)
                            items.append({
                                "id": relative_path,
                                "name": item,
                                "type": "file",
                                "path": relative_path,
                                "uploadDate": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                            })
                        except Exception as e:
                            print(f"Error processing file {item_path}: {str(e)}")
                            continue
                
                # Sort items: directories first, then files by modification time
                directories = [item for item in items if item["type"] == "directory"]
                files = [item for item in items if item["type"] == "file"]
                files.sort(key=lambda x: x["uploadDate"], reverse=True)
                
                return directories + files
            
            # If neither file nor directory exists, return empty list
            return []
        
        # If no subdir specified, scan the base directory
        return scan_directory(base_dir)
        
    except Exception as e:
        print(f"Error in get_resumes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def scan_directory(directory):
    """Helper function to scan a directory and return its contents."""
    items = []
    try:
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            relative_path = os.path.relpath(item_path, "Original_Resumes")
            
            if os.path.isdir(item_path):
                items.append({
                    "id": relative_path,
                    "name": item,
                    "type": "directory",
                    "path": relative_path,
                    "uploadDate": datetime.fromtimestamp(os.path.getmtime(item_path)).isoformat(),
                    "items": scan_directory(item_path)
                })
            elif item.lower().endswith(('.pdf', '.doc', '.docx', '.txt')):
                try:
                    file_stats = os.stat(item_path)
                    items.append({
                        "id": relative_path,
                        "name": item,
                        "type": "file",
                        "path": relative_path,
                        "uploadDate": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
                    })
                except Exception as e:
                    print(f"Error processing file {item_path}: {str(e)}")
                    continue
    except Exception as e:
        print(f"Error scanning directory {directory}: {str(e)}")
        return []
    
    # Sort items: directories first, then files by modification time
    directories = [item for item in items if item["type"] == "directory"]
    files = [item for item in items if item["type"] == "file"]
    files.sort(key=lambda x: x["uploadDate"], reverse=True)
    
    return directories + files

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Create parsed_resumes directory if it doesn't exist
        os.makedirs("parsed_resumes", exist_ok=True)
        
        # Save the uploaded file
        file_path = f"parsed_resumes/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {"message": "Resume uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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

@app.post("/api/mistral/chat")
async def chat_with_mistral(message: ChatMessage):
    try:
        # Prepare the prompt for Mistral
        prompt = f"""You are a resume assistant. I will provide you with:
1. Multiple resume contents (each marked with its name)
2. The analysis results
3. A question from the user

Please use all the resume contents and analysis results to provide a comprehensive answer. When comparing or analyzing multiple resumes, make sure to reference which resume you're talking about by its name.

Resume Contents:
{message.resume_text}

Analysis Results:
{json.dumps(message.analysis, indent=2) if message.analysis else "No analysis results available"}

User Question: {message.question}

Please provide a clear and concise response focusing on the specific question asked. Use all the resume contents and analysis results to give a thorough answer. When comparing resumes or discussing specific details, always specify which resume you're referring to."""

        # Call local Mistral
        response = call_local_mistral(prompt)
        
        return {"response": response}
    except Exception as e:
        print(f"Error in chat with Mistral: {str(e)}")
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
