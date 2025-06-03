import requests
import json

def test_resume_analysis():
    """Test the resume analysis API endpoint."""
    print("\n=== Testing Resume Analysis API ===")
    
    # Test data
    test_data = {
        "jobDescription": "We are looking for a Python developer with experience in web development and machine learning.",
        "resumes": [
            {
                "id": "test1",
                "name": "Test Resume 1",
                "content": """
                John Doe
                Python Developer
                
                Skills:
                - Python
                - Web Development
                - Machine Learning
                - Flask
                
                Experience:
                - Senior Developer at Tech Corp (2020-2023)
                - Junior Developer at StartUp Inc (2018-2020)
                
                Education:
                - BS Computer Science, University of Technology
                """
            }
        ]
    }
    
    try:
        print("Sending test request to API...")
        response = requests.post(
            'http://localhost:8000/api/analyze-resumes',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nResponse Status Code: {response.status_code}")
        
        if response.status_code == 200:
            results = response.json()
            print("\nAnalysis Results:")
            for result in results:
                print(f"\nResume: {result['name']}")
                print(f"Overall Score: {result['score']}%")
                print(f"Skills: {', '.join(result['skills'])}")
                print(f"Experience Match: {result['experienceMatch']}%")
                print(f"Education Match: {result['educationMatch']}%")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing API: {str(e)}")

if __name__ == '__main__':
    test_resume_analysis() 