from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os

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

# Global OPTIONS handler for preflight checks - removed manual CORS headers
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return app.make_default_options_response()

# Direct test endpoint - removed manual CORS headers
@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_endpoint():
    """Simple test endpoint for debugging"""
    if request.method == 'OPTIONS':
        return app.make_default_options_response()
        
    return jsonify({'status': 'success', 'message': 'Test endpoint working from main.py'})

try:
    # Try to import ML modules
    from job_routes import job_routes
    from salary_prediction_service import salary_prediction_bp
    # Attempt to import prediction_service. If this fails, 
    # routes relying on it will fail at runtime or blueprint registration might be affected.
    from ml_model.salary_service import prediction_service 
    
    # Register route blueprints
    app.register_blueprint(job_routes)
    app.register_blueprint(salary_prediction_bp)
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
