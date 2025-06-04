from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import logging
import os
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='static')
# Enable CORS with more permissive configuration
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"])

# Create static folder if it doesn't exist
os.makedirs(os.path.join(os.path.dirname(__file__), 'static', 'images'), exist_ok=True)

# Favicon routes
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'images'),
                               filename)

# Root endpoint for health check
@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Backend API is running"
    })

# Global OPTIONS handler for preflight checks
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = app.make_default_options_response()
    return response

# Direct test endpoint 
@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    if request.method == 'OPTIONS':
        return app.make_default_options_response()
        
    return jsonify({'status': 'success', 'message': 'Test endpoint working from main.py'})

# Flag to indicate if ML functionality is available
ml_available = False

try:
    # Try to import ML modules
    from job_routes import job_routes
    from salary_prediction_service import salary_prediction_bp
    from ml_model.salary_service import prediction_service
    
    # Register route blueprints
    app.register_blueprint(job_routes)
    app.register_blueprint(salary_prediction_bp)
    ml_available = True
    logger.info("ML modules loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import ML modules: {e}")
    traceback.print_exc()
    # Continue without ML functionality
except Exception as e:
    logger.error(f"Error initializing ML functionality: {e}")
    traceback.print_exc()

# Add an endpoint to check ML availability
@app.route('/api/status')
def api_status():
    return jsonify({
        "status": "ok",
        "ml_available": ml_available,
        "message": "ML functionality is available" if ml_available else "ML functionality is not available"
    })

def test_prediction():
    """
    Test the salary prediction service
    """
    if not ml_available:
        logger.warning("ML functionality not available, skipping prediction test")
        return {"error": "ML functionality not available"}
        
    # Initialize the service
    initialized = prediction_service.initialize()
    print(f"Service initialized: {initialized}")
    
    # Test with sample data
    test_data = {
        "title": "Software Engineer",
        "location": "San Francisco",
        "formatted_work_type": "Full-time",
        "formatted_experience_level": "Mid level",
        "company_industries": "Technology",
        "skill_requirement": "Python, JavaScript, React",
        "education_requirement": "Bachelor's degree",
        "certification_requirement": "",
        "experience_requirement": "3+ years",
        "remote_allowed": True,
        "company_employee_count": 500
    }
    
    # Make prediction
    result = prediction_service.predict(test_data)
    print(f"Prediction result: {result}")
    
    # Test similar jobs
    jobs = prediction_service.get_similar_jobs({"title": "Software Engineer", "skills": ["Python", "JavaScript"]})
    print(f"Similar jobs: {jobs[:1]}")  # Print first job only to save space
    
    return result

if __name__ == '__main__':
    # Run a test prediction if ML is available
    if ml_available:
        print("\n=== Testing Salary Prediction Service ===")
        try:
            result = test_prediction()
            print("Test completed successfully!")
            print(f"Salary prediction: {result.get('estimatedSalary', 'N/A')}")
            print("=== Test End ===\n")
        except Exception as e:
            print(f"Test failed: {e}")
            traceback.print_exc()
    else:
        print("\nWarning: ML functionality is not available. The backend will run without salary prediction features.")
    
    # Start the server
    logger.info("Starting backend server...")
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host=host, port=port, debug=debug)
