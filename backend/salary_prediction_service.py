import requests
from flask import Blueprint, request, jsonify
import traceback
import logging
import json
import os

# Only try to import prediction service if needed
try:
    from ml_model.salary_service import prediction_service
    PREDICTION_SERVICE_AVAILABLE = True
except ImportError:
    PREDICTION_SERVICE_AVAILABLE = False

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint for salary prediction routes
salary_prediction_bp = Blueprint('salary_prediction', __name__)

# Mock data for testing
MOCK_SIMILAR_JOBS = [
    {
        "title": "Software Engineer",
        "company": "Google",
        "location": "Mountain View, CA",
        "salary": {"min": 10, "max": 15},
        "url": "#",
        "skills": ["JavaScript", "Python", "React"]
    },
    {
        "title": "Frontend Developer",
        "company": "Microsoft",
        "location": "Seattle, WA",
        "salary": {"min": 9, "max": 13},
        "url": "#",
        "skills": ["JavaScript", "CSS", "React"]
    },
    {
        "title": "Backend Developer",
        "company": "Amazon",
        "location": "Remote",
        "salary": {"min": 10, "max": 14},
        "url": "#",
        "skills": ["Python", "Django", "AWS"]
    }
]

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
    logger.debug(f"Received salary prediction request with method: {request.method}")
    
    # Handle OPTIONS requests
    if request.method == 'OPTIONS':
        logger.debug("Handling OPTIONS request for salary prediction")
        return jsonify({})  # Return empty response for OPTIONS
        
    try:
        logger.debug("Processing POST request for salary prediction")
        # Get data from the request
        data = request.json
        logger.debug(f"Request data: {data}")
        
        if PREDICTION_SERVICE_AVAILABLE:
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
            
            logger.debug("Calling prediction service")
            # Use the local prediction service
            result = prediction_service.predict(ml_request_data)
        else:
            # Use mock data
            logger.debug("Using mock salary prediction data")
            yearly_salary = 75000
            result = {
                "success": True,
                "estimatedSalary": f"${yearly_salary/12:,.2f}/month",
                "yearly": f"${yearly_salary:,.2f}/year",
                "monthly": f"${yearly_salary/12:,.2f}/month",
                "salaryValue": round(yearly_salary/1000)  # In thousands
            }
        
        logger.debug(f"Prediction result: {result}")
        return jsonify(result)
            
    except Exception as e:
        logger.error(f"Error in salary prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@salary_prediction_bp.route('/api/jobs/similar-jobs', methods=['POST', 'OPTIONS'])
def get_similar_jobs():
    """
    Endpoint for similar jobs using local ML model
    """
    logger.debug(f"Received similar jobs request with method: {request.method}")
    
    # Handle OPTIONS requests
    if request.method == 'OPTIONS':
        logger.debug("Handling OPTIONS request for similar jobs")
        return jsonify({})  # Return empty response for OPTIONS
        
    try:
        logger.debug("Processing POST request for similar jobs")
        # Get data from the request
        data = request.json
        logger.debug(f"Request data: {data}")
        
        if PREDICTION_SERVICE_AVAILABLE:
            # Format the request data
            job_data = {
                "title": data.get('title', ''),
                "location": data.get('location', ''),
                "keywords": data.get('keywords', ''),
                "skills": data.get('skills', []),
                "workType": data.get('workType', '')
            }
            
            # Map work types to contract types (same logic as in ML service)
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
            
            logger.debug("Calling similar jobs service")
            # Use local service for similar jobs
            similar_jobs = prediction_service.get_similar_jobs(job_data)
        else:
            # Use mock data
            logger.debug("Using mock similar jobs data")
            similar_jobs = MOCK_SIMILAR_JOBS
            
        logger.debug(f"Found {len(similar_jobs)} similar jobs")
        return jsonify(similar_jobs)
            
    except Exception as e:
        logger.error(f"Error in similar jobs: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500 