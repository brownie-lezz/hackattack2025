from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import datetime
from typing import List, Dict, Union

# Define the path to the users JSON file
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
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

# Add these new Pydantic models for profile data
class ProfileResponse(BaseModel):
    name: str
    email: str
    phone_number: str = None
    city: str = None
    country: str = None
    job_title: str = None
    bio: str = None
    skills: str = None
    github: str = None
    linkedin: str = None
    website: str = None

class CompanyProfileResponse(BaseModel):
    company_name: str
    contact_email: str
    company_location: str = None
    country: str = None
    company_description: str = None
    linkedin: str = None
    website: str = None

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

# Add these new endpoints
@app.get("/api/profile/seeker/")
async def get_seeker_profile():
    """Get the current user's seeker profile."""
    users = read_users()
    # In a real app, you would get the current user's ID from the session/token
    # For now, we'll just return the first seeker user we find
    user = next((user for user in users if user.get('role') == 'seeker'), None)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@app.get("/api/profile/seeker/{id}")
async def get_seeker_profile_by_id(id: str):
    """Get a seeker's profile by ID."""
    users = read_users()
    user = next((user for user in users if user.get('role') == 'seeker' and str(user.get('id')) == id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@app.get("/api/profile/employer/")
async def get_employer_profile():
    """Get the current user's employer profile."""
    users = read_users()
    # In a real app, you would get the current user's ID from the session/token
    # For now, we'll just return the first employer user we find
    user = next((user for user in users if user.get('role') == 'employer'), None)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@app.get("/api/profile/employer/{id}")
async def get_employer_profile_by_id(id: str):
    """Get an employer's profile by ID."""
    users = read_users()
    user = next((user for user in users if user.get('role') == 'employer' and str(user.get('id')) == id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@app.put("/api/profile/seeker/")
async def update_seeker_profile(profile_data: ProfileResponse):
    """Update the current user's seeker profile."""
    users = read_users()
    # In a real app, you would get the current user's ID from the session/token
    # For now, we'll just update the first seeker user we find
    user_index = next((i for i, user in enumerate(users) if user.get('role') == 'seeker'), None)
    if user_index is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update the user's profile
    users[user_index].update(profile_data.dict(exclude_unset=True))
    write_users(users)
    
    return users[user_index]

# You would typically run this with uvicorn:
# python -m uvicorn backend.main:app --reload 