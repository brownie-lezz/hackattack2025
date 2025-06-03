from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import datetime
from typing import List, Dict, Union
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Google AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# List available models
available_models = [m.name for m in genai.list_models()]
print("Available models:", available_models)  # This will help us see which models we can use

# Define the path to the users JSON file
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

# Define the path to the jobs JSON file
JOBS_FILE = os.path.join(os.path.dirname(__file__), 'jobs.json')

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
# In a production environment, you should restrict origins to your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"], # Allow requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request data
class SeekerSignupData(BaseModel):
    role: str = "seeker"
    name: str # Full Name
    email: str
    password: str
    re_password: str
    phone: str
    job_title: str
    experience: str
    skills: List[str]
    location: str
    resume_url: str

class EmployerSignupData(BaseModel):
    role: str = "employer"
    name: str # Company Name
    email: str
    password: str
    re_password: str
    phone: str
    industry: str
    company_size: str
    company_website: str
    company_location: str
    company_description: str
    contact_person: str

class SignupRequest(BaseModel):
    role: str
    email: str
    password: str
    re_password: str
    name: str
    phone: str
    job_title: Union[str, None] = None
    experience: Union[str, None] = None
    skills: Union[List[str], None] = None
    location: Union[str, None] = None
    resume_url: Union[str, None] = None
    industry: Union[str, None] = None
    company_size: Union[str, None] = None
    company_website: Union[str, None] = None
    company_location: Union[str, None] = None
    company_description: Union[str, None] = None
    contact_person: Union[str, None] = None

# Pydantic model for login request data
class LoginRequest(BaseModel):
    email: str
    password: str

class QuestionGenerationRequest(BaseModel):
    job_id: str
    num_questions: int
    question_types: List[str]
    job_title: str = None
    job_description: str = None
    required_skills: List[str] = None

class Job(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]
    company: str
    location: str
    salary_range: str = None
    job_type: str = None

def read_users():
    """Reads user data from the JSON file."""
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, 'r') as f:
            # Handle empty file case
            content = f.read()
            if not content:
                return []
            # Move the file pointer to the beginning after reading content
            f.seek(0)
            return json.load(f)
    except json.JSONDecodeError:
        # Handle cases where the file is not valid JSON or empty
        return []
    except Exception as e:
        print(f"Error reading users file: {e}")
        return []

def write_users(users):
    """Writes user data to the JSON file."""
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=4)
    except Exception as e:
        print(f"Error writing users file: {e}")

def read_jobs():
    """Reads job data from the JSON file."""
    if not os.path.exists(JOBS_FILE):
        # Create sample jobs if file doesn't exist
        sample_jobs = [
            {
                "id": "1",
                "title": "Software Engineer",
                "description": "We are looking for a skilled Software Engineer to join our team. The ideal candidate should have strong programming skills and experience with modern web technologies.",
                "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"],
                "company": "Tech Solutions Inc",
                "location": "New York, NY",
                "salary_range": "$80,000 - $120,000",
                "job_type": "Full-time"
            },
            {
                "id": "2",
                "title": "Data Scientist",
                "description": "Join our data science team to work on exciting machine learning projects. The role involves developing and implementing data models and algorithms.",
                "required_skills": ["Python", "Machine Learning", "Statistics", "SQL", "Data Analysis"],
                "company": "Data Analytics Corp",
                "location": "San Francisco, CA",
                "salary_range": "$90,000 - $130,000",
                "job_type": "Full-time"
            }
        ]
        write_jobs(sample_jobs)
        return sample_jobs

    try:
        with open(JOBS_FILE, 'r') as f:
            content = f.read()
            if not content:
                return []
            return json.load(f)
    except json.JSONDecodeError:
        return []
    except Exception as e:
        print(f"Error reading jobs file: {e}")
        return []

def write_jobs(jobs):
    """Writes job data to the JSON file."""
    try:
        with open(JOBS_FILE, 'w') as f:
            json.dump(jobs, f, indent=4)
    except Exception as e:
        print(f"Error writing jobs file: {e}")

@app.post("/api/signup")
async def signup_user_endpoint(user_data: SignupRequest):
    """FastAPI endpoint to handle user signup."""
    users = read_users()

    # Check if email already exists
    for user in users:
        if user.get('email') == user_data.email:
            raise HTTPException(status_code=400, detail="Email already exists.")

    # Validate password match
    if user_data.password != user_data.re_password:
         raise HTTPException(status_code=400, detail="Passwords do not match.")
         
    # Create new user dictionary
    new_user = {
        'role': user_data.role,
        'name': user_data.name,
        'email': user_data.email,
        'password': user_data.password, # Remember to hash this in a real app!
        'phone': user_data.phone,
        'created_at': str(datetime.datetime.now()),
    }

    # Add role-specific fields
    if user_data.role == 'seeker':
        # Check for required seeker fields, allowing None for optional ones defined in model
        if not all([
            user_data.job_title is not None,
            user_data.experience is not None,
            user_data.skills is not None,
            user_data.location is not None,
            user_data.resume_url is not None
        ]):
             raise HTTPException(status_code=400, detail="Missing seeker-specific fields.")
        new_user.update({
            'job_title': user_data.job_title,
            'experience': user_data.experience,
            'skills': user_data.skills,
            'location': user_data.location,
            'resume_url': user_data.resume_url
        })
    elif user_data.role == 'employer':
        # Check for required employer fields, allowing None for optional ones defined in model
        if not all([
            user_data.industry is not None,
            user_data.company_size is not None,
            user_data.company_website is not None,
            user_data.company_location is not None,
            user_data.company_description is not None,
            user_data.contact_person is not None
        ]):
             raise HTTPException(status_code=400, detail="Missing employer-specific fields.")

        new_user.update({
            'industry': user_data.industry,
            'company_size': user_data.company_size,
            'company_website': user_data.company_website,
            'company_location': user_data.company_location,
            'company_description': user_data.company_description,
            'contact_person': user_data.contact_person
        })
    else:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    users.append(new_user)
    write_users(users)

    return {"message": f"{user_data.role.capitalize()} {user_data.name} signed up successfully!"}

@app.post("/api/login")
async def login_user_endpoint(login_data: LoginRequest):
    """FastAPI endpoint to handle user login."""
    users = read_users()

    # Find the user by email
    user = next((user for user in users if user.get('email') == login_data.email), None)

    # Check if user exists and password matches (plain text comparison for now - hash in real app!)
    if user is None or user.get('password') != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # In a real application, you would generate a JWT or session token here
    # For now, just return a success message and the user's role and name
    return {"message": f"Login successful for user {user.get('name')}!", "user": {"name": user.get('name'), "role": user.get('role')}}

@app.post("/api/generate-questions")
async def generate_questions(request: QuestionGenerationRequest):
    """Generate AI-powered interview questions based on job requirements."""
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Create a more detailed prompt with job context and specific instructions
        prompt = f"""You are an expert HR professional conducting an interview for a {request.job_title} position.
        
        Job Description: {request.job_description}
        Required Skills: {', '.join(request.required_skills) if request.required_skills else 'Not specified'}
        
        Generate {request.num_questions} completely different interview questions. Each question must be unique in both topic and approach.
        
        Question Types to Include:
        - Technical questions about specific skills
        - Behavioral questions about past experiences
        - Situational questions about hypothetical scenarios
        - Problem-solving questions
        - Leadership and teamwork questions
        
        Guidelines:
        1. Each question must be completely different from the others
        2. Questions should progress from general to specific
        3. Include at least one question about each required skill
        4. Mix different question types
        5. Avoid similar questions or rephrasing of the same question
        6. Make questions specific to the {request.job_title} role
        7. First question should be a general introduction/background question
        8. Second question should be about technical skills or experience
        9. Third question should be about problem-solving or behavioral scenario
        10. Fourth question should be about leadership or teamwork
        11. Fifth question should be about future goals or company fit
        
        Format your response as a JSON array of strings, with no additional text or formatting.
        Example format: ["Question 1?", "Question 2?", "Question 3?"]"""

        print("Sending prompt to AI:", prompt)  # Debug log

        # Generate response
        response = model.generate_content(prompt)
        
        # Parse the response and extract questions
        questions_text = response.text.strip()
        print("Raw AI response:", questions_text)  # Debug log
        
        # Try to parse the response as JSON
        try:
            # Clean the response text before parsing
            cleaned_text = questions_text
            # Remove any markdown code block markers
            cleaned_text = cleaned_text.replace('```json', '').replace('```', '')
            # Remove any leading/trailing whitespace
            cleaned_text = cleaned_text.strip()
            
            questions = json.loads(cleaned_text)
            print("Parsed questions:", questions)  # Debug log
            
            # Clean each question
            questions = [q.strip() for q in questions]
            # Remove any remaining JSON artifacts
            questions = [q.replace('[', '').replace(']', '').replace('{', '').replace('}', '') for q in questions]
            # Remove any empty questions
            questions = [q for q in questions if q and not q.isspace()]
            
        except json.JSONDecodeError as e:
            print("JSON parsing error:", str(e))  # Debug log
            # If the response isn't valid JSON, try to extract questions from the text
            questions = [q.strip() for q in questions_text.split('\n') if q.strip()]
            # Remove any markdown formatting, numbers, or JSON artifacts
            questions = [q.lstrip('1234567890.- ').strip() for q in questions]
            questions = [q.replace('[', '').replace(']', '').replace('{', '').replace('}', '') for q in questions]
            # Remove any empty questions
            questions = [q for q in questions if q and not q.isspace()]
            print("Extracted questions after JSON error:", questions)  # Debug log

        # Remove any duplicate questions
        original_count = len(questions)
        questions = list(dict.fromkeys(questions))
        if len(questions) < original_count:
            print(f"Removed {original_count - len(questions)} duplicate questions")  # Debug log

        # Ensure we have the requested number of questions
        if len(questions) > request.num_questions:
            questions = questions[:request.num_questions]
        elif len(questions) < request.num_questions:
            print(f"Not enough questions ({len(questions)}), adding default questions")  # Debug log
            # If we don't have enough questions, add some generic ones
            default_questions = [
                "Can you walk me through your professional background and what led you to apply for this position?",
                f"Tell me about your experience with {request.required_skills[0] if request.required_skills else 'the key technologies'} used in this role.",
                "How do you handle challenging situations in the workplace?",
                "What interests you most about this position at " + (request.job_title or "our company") + "?",
                "Can you describe a project where you demonstrated leadership?"
            ]
            # Filter out any default questions that might be similar to existing ones
            default_questions = [q for q in default_questions if not any(
                q.lower() in existing.lower() or existing.lower() in q.lower() 
                for existing in questions
            )]
            print("Filtered default questions:", default_questions)  # Debug log
            questions.extend(default_questions[:request.num_questions - len(questions)])

        print("Final questions:", questions)  # Debug log
        return {"questions": questions}

    except Exception as e:
        print(f"Error generating questions: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    """Get job details by ID."""
    jobs = read_jobs()
    job = next((job for job in jobs if job.get('id') == job_id), None)
    
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

# You would typically run this with uvicorn:
# python -m uvicorn backend.main:app --reload 