import requests
from flask import Blueprint, request, jsonify
import traceback
import json
import os
import sys

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

# Test endpoint
@salary_prediction_bp.route('/api/test', methods=['GET', 'OPTIONS'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    if request.method == 'OPTIONS':
        return jsonify({})  # Return empty response for OPTIONS
    return jsonify({'status': 'success', 'message': 'Test endpoint working'})

@salary_prediction_bp.route('/api/jobs/salary-prediction', methods=['POST', 'OPTIONS'])
def predict_salary():
    """
    Endpoint for salary prediction using local ML model
    """
    # Handle OPTIONS requests
    if request.method == 'OPTIONS':
        return jsonify({})  # Return empty response for OPTIONS
        
    # Check if the prediction service was loaded
    if prediction_service is None:
        print("[ERROR] salary_prediction_service.py: prediction_service is None. ML service failed to load.", file=sys.stderr)
        return jsonify({
            "success": False,
            "error": "Machine Learning service is unavailable due to an import failure."
        }), 503 # Service Unavailable

    try:
        # Get data from the request
        data = request.json
        
        # Format the request data for the ML service
        ml_request_data = {
            "title": data.get('title', ''),
            "location": data.get('location', 'Remote'),
            "formatted_work_type": data.get('workType', 'Full-time'),
            "formatted_experience_level": data.get('experienceLevel', 'Entry level'),
            "company_industries": data.get('industry', 'Technology'),
            "skill_requirement": ', '.join(data.get('skills', [])) if isinstance(data.get('skills', []), list) else data.get('skills', ''),
            "education_requirement": data.get('education', ''),
            "certification_requirement": data.get('certification', ''),
            "experience_requirement": data.get('experience', ''),
            "remote_allowed": data.get('remote', False),
            "company_employee_count": data.get('companySize', 500)
        }
        
        # Use the local prediction service
        # The prediction_service.predict method itself handles initialization 
        # and returns a dict with {success: False, error: ...} on failure.
        result = prediction_service.predict(ml_request_data)
        
        if not result.get("success", False):
             # If the service indicates an error, return a 500 status code
             return jsonify(result), 500
                
        return jsonify(result)
            
    except Exception as e:
        # Catch any other unexpected errors during request processing or service call
        print(f"[DEBUG] Exception in /api/jobs/salary-prediction route: {e}", file=sys.stderr)
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


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