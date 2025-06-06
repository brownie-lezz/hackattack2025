import requests
from flask import Blueprint, request, jsonify
import traceback
import json
import os
import sys
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

# Initialize prediction_service to None
prediction_service = None

# Only try to import prediction service if needed
try:
    from ml_model.salary_service import prediction_service as ml_prediction_service
    prediction_service = ml_prediction_service # Assign if import is successful
except ImportError as e: # Catching the specific error is good practice
    # If the prediction service isn't available, these routes will rely on its absence.
    # The service itself handles initialization errors now.
    print(f"[CRITICAL] Failed to import prediction_service: {e}", file=sys.stderr)
    # prediction_service remains None
    pass 

# Create Blueprint for salary prediction routes
salary_prediction_bp = Blueprint('salary_prediction', __name__)

# Create the router
router = APIRouter(prefix="/api/salary", tags=["salary"])

class SalaryPredictionRequest(BaseModel):
    job_title: str
    location: str
    experience_years: Optional[int] = None
    education_level: Optional[str] = None
    skills: Optional[List[str]] = None

# Test endpoint
@salary_prediction_bp.route('/api/test', methods=['GET', 'OPTIONS'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    if request.method == 'OPTIONS':
        return jsonify({})  # Return empty response for OPTIONS
    return jsonify({'status': 'success', 'message': 'Test endpoint working'})

@router.post("/predict")
async def predict_salary(request: SalaryPredictionRequest):
    try:
        # Here you would typically call your ML model
        # For now, return a mock response
        return {
            "success": True,
            "predicted_salary": {
                "min": 50000,
                "max": 80000,
                "median": 65000,
                "currency": "USD"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@salary_prediction_bp.route('/api/jobs/similar-jobs', methods=['POST', 'OPTIONS'])
def get_similar_jobs():
    """
    Endpoint for similar jobs using local ML model
    """
    # Handle OPTIONS requests
    if request.method == 'OPTIONS':
        return jsonify({})  # Return empty response for OPTIONS
        
    try:
        # Get data from the request
        data = request.json
        
        # Format the request data
        job_data = {
            "title": data.get('title', ''),
            "location": data.get('location', ''),
            "keywords": data.get('keywords', ''),
            "skills": data.get('skills', []),
            "workType": data.get('workType', '')
        }
        
        # Map work types to contract types (same logic as in ML service)
        # This mapping might be better inside the prediction_service.get_similar_jobs if it's tightly coupled
        if job_data["workType"] == 'Full-time':
            job_data["contractType"] = 'p'  # permanent
            job_data["contractPeriod"] = 'f'  # full time
        elif job_data["workType"] == 'Part-time':
            job_data["contractType"] = 'p'  # permanent
            job_data["contractPeriod"] = 'p'  # part time
        elif job_data["workType"] == 'Contract':
            job_data["contractType"] = 'c'  # contract
        elif job_data["workType"] == 'Temporary':
            job_data["contractType"] = 't'  # temporary
        elif job_data["workType"] == 'Internship':
            job_data["contractType"] = 'i'  # training
        
        # The prediction_service.get_similar_jobs now raises RuntimeError on failure.
        similar_jobs = prediction_service.get_similar_jobs(job_data)
        return jsonify(similar_jobs)
            
    except RuntimeError as e:
        # Handle errors specifically from the get_similar_jobs service call
        return jsonify({
            "success": False,
            "error": str(e) 
        }), 503 # Service Unavailable or other appropriate error for service failure
    except Exception as e:
        # Catch any other unexpected errors
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500 