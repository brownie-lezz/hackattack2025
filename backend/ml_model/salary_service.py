from pathlib import Path
import pandas as pd
import cloudpickle
import sys
import os
from .multi_layer_perceptron import CustomNeuralNetRegressor, Model, TensorTransformer
import logging
import socket
try:
    from careerjet_api_client import CareerjetAPIClient
    CAREERJET_AVAILABLE = True
except ImportError:
    CAREERJET_AVAILABLE = False
    logging.warning("CareerjetAPIClient not found, using mock implementation for similar jobs")

logger = logging.getLogger(__name__)

class SalaryPredictionService:
    def __init__(self):
        self.preprocessor = None
        self.model = None
        self.company_industries = None
        self.initialized = False
        self._current_dir = Path(__file__).parent
        
    def initialize(self):
        """Initialize the salary prediction service."""
        if self.initialized:
            return True
            
        try:
            # Setup paths relative to the current module
            preprocessor_path = self._current_dir / "models" / "preprocessor.cloudpickle"
            model_path = self._current_dir / "models" / "mlp_params.pkl"
            industries_path = self._current_dir / "data" / "company_industries.csv"
            
            # Check if model files exist
            if not all(p.exists() for p in [preprocessor_path, model_path, industries_path]):
                logger.error("Model files not found. Please make sure to copy the model files to the appropriate directories.")
                return False
            
            # Load preprocessor
            logger.info("Loading preprocessor...")
            with open(preprocessor_path, 'rb') as f:
                self.preprocessor = cloudpickle.load(f)
            logger.info("Preprocessor loaded successfully")

            # Initialize neural network
            logger.info("Initializing neural network...")
            self.model = CustomNeuralNetRegressor(
                Model,
                device='cpu',
                torch_load_kwargs={'weights_only': True},
                **{
                    'lambda1': 0.0001,
                    'lr': 0.00447,
                    'batch_size': 128,
                    'module__num_hidden_layers': 3,
                    'module__n_units_last': 256,
                    'module__dropout_rate': 0.5,
                }
            )
            self.model.initialize()
            logger.info("Neural network initialized")
            
            # Load model parameters
            logger.info("Loading model parameters...")
            self.model.load_params(str(model_path))
            logger.info("Model parameters loaded successfully")
            
            # Load company industries data
            df_company_industries = pd.read_csv(industries_path)
            self.company_industries = df_company_industries.iloc[:, 0].tolist()
            
            self.initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Error initializing salary prediction service: {e}")
            return False
        
    def predict(self, job_data):
        """
        Predict salary for a job posting
        
        Args:
            job_data (dict): Job posting data
        
        Returns:
            dict: Prediction result
        """
        if not self.initialized:
            success = self.initialize()
            if not success:
                return {
                    "success": False,
                    "error": "Failed to initialize salary prediction service"
                }
                
        try:
            # Format the request data for the ML model
            input_data = pd.DataFrame({
                'title': [job_data.get('title', '')],
                'location': [job_data.get('location', 'Remote')],
                'formatted_work_type': [job_data.get('formatted_work_type', 'Full-time')],
                'formatted_experience_level': [job_data.get('formatted_experience_level', 'Entry level')],
                'company_industries': [job_data.get('company_industries', 'Technology')],
                'extracted_skill_requirement': [job_data.get('skill_requirement', '')],
                'extracted_education_requirement': [job_data.get('education_requirement', '')],
                'extracted_certification_requirement': [job_data.get('certification_requirement', '')],
                'extracted_experience_requirement': [job_data.get('experience_requirement', '')],
                'remote_allowed': [1.0 if job_data.get('remote_allowed', False) else 0.0],
                'company_employee_count': [job_data.get('company_employee_count', 500)],
                'company_state': [None],
                'company_country': ["US"],
            })

            # Transform the input data
            X = self.preprocessor.transform(input_data)
            X = TensorTransformer().transform(X)
            
            # Make prediction
            predictions = self.model.predict(X).reshape(-1)
            yearly_salary = predictions[0]
            
            # Determine output format
            as_monthly = job_data.get('as_monthly', True)
            if as_monthly:
                # Convert to monthly salary
                monthly_salary = yearly_salary / 12
                estimated_salary = f"${monthly_salary:,.2f}/month"
            else:
                estimated_salary = f"${yearly_salary:,.2f}/year"
                
            # Format response with both yearly and monthly values
            result = {
                "success": True,
                "estimatedSalary": estimated_salary,
                "yearly": f"${yearly_salary:,.2f}/year",
                "monthly": f"${yearly_salary/12:,.2f}/month",
                "salaryValue": round(yearly_salary/1000)  # In thousands
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            return {
                "success": False,
                "error": str(e)
            }
            
    def get_similar_jobs(self, job_data):
        """
        Generate similar job listings using CareerjetAPI
        
        Args:
            job_data (dict): Job posting data
        
        Returns:
            list: Similar job listings
        """
        try:
            # Check if CareerjetAPI is available
            if not CAREERJET_AVAILABLE:
                return self._get_mock_similar_jobs(job_data)
                
            # Extract data
            title = job_data.get('title', '')
            location = job_data.get('location', 'USA')
            keywords = job_data.get('keywords', '')
            contracttype = job_data.get('contractType')
            contractperiod = job_data.get('contractPeriod')
            
            # Initialize Careerjet API client
            cj = CareerjetAPIClient("en_US")
            
            # Get the local IP to use for user_ip parameter
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                s.close()
            except:
                local_ip = '127.0.0.1'
            
            # Create search query
            search_params = {
                'location': location or 'USA',
                'keywords': keywords or title,
                'affid': '602e3a71903dec4ef6402764959a6f8c',  # Use the provided affiliate ID
                'user_ip': local_ip,
                'url': f'http://localhost/jobsearch?q={title}&l={location}',
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
            
            # Add optional parameters if provided
            if contracttype:
                search_params['contracttype'] = contracttype
                
            if contractperiod:
                search_params['contractperiod'] = contractperiod
            
            # Execute the search
            result_json = cj.search(search_params)
            
            # Format the results to match our expected structure
            similar_jobs = []
            if 'jobs' in result_json and len(result_json['jobs']) > 0:
                # Get up to 5 jobs
                for job in result_json['jobs'][:5]:
                    # Extract salary if available
                    salary_min = None
                    salary_max = None
                    
                    # In real implementation, you'd parse the salary info from job['salary']
                    # This is a simplified example
                    if 'salary' in job and job['salary']:
                        # Very simple parsing, in production would need more robust parsing
                        salary_text = job['salary']
                        if '-' in salary_text:
                            parts = salary_text.replace('$', '').replace(',', '').split('-')
                            if len(parts) == 2:
                                try:
                                    min_val = float(parts[0].strip())
                                    max_val = float(parts[1].strip())
                                    # Convert to thousands for consistency with frontend
                                    salary_min = round(min_val / 1000)
                                    salary_max = round(max_val / 1000)
                                except:
                                    pass
                    
                    # Extract skills (simplified - in production would need NLP)
                    skills = []
                    if 'description' in job and job['description']:
                        # Very simple skill extraction based on common tech keywords
                        common_skills = ["Python", "JavaScript", "React", "TypeScript", "Node.js", 
                                        "Java", "C++", "AWS", "Docker", "Kubernetes"]
                        for skill in common_skills:
                            if skill.lower() in job['description'].lower():
                                skills.append(skill)
                    
                    # Build the job object, with salary only if valid values were extracted
                    job_obj = {
                        'title': job.get('title', ''),
                        'company': job.get('company', ''),
                        'location': job.get('locations', ''),
                        'url': job.get('url', '#'),
                        'skills': skills or ["Not specified"]
                    }
                    
                    # Add salary only if we have valid values
                    if salary_min is not None and salary_max is not None:
                        job_obj['salary'] = {
                            'min': salary_min,
                            'max': salary_max
                        }
                    
                    similar_jobs.append(job_obj)
                    
                return similar_jobs
            else:
                # Fall back to mock data if no results
                return self._get_mock_similar_jobs(job_data)
                
        except Exception as e:
            logger.error(f"Error fetching similar jobs: {e}")
            # Fall back to mock implementation on error
            return self._get_mock_similar_jobs(job_data)
            
    def _get_mock_similar_jobs(self, job_data):
        """Mock implementation for similar jobs when CareerjetAPI fails or is unavailable"""
        companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Netflix']
        locations = ['New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Remote']
        skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']
        
        title = job_data.get('title', '')
        location = job_data.get('location', 'Remote')
        job_skills = job_data.get('skills', [])
        
        # Generate 3 mock job listings
        similar_jobs = []
        for i in range(3):
            # Pick a random set of skills (2-4)
            num_skills = min(4, max(2, len(job_skills) if isinstance(job_skills, list) else 0))
            job_skills_list = job_skills[:num_skills] if job_skills and isinstance(job_skills, list) else skills[:3]
            
            # Generate monthly salary ranges
            base_salary_monthly = 7 + i  # Monthly in thousands
            if 'senior' in title.lower() or 'lead' in title.lower():
                base_salary_monthly += 3
                
            similar_jobs.append({
                'title': title,
                'company': companies[i % len(companies)],
                'location': location or locations[i % len(locations)],
                'salary': {
                    'min': base_salary_monthly,
                    'max': base_salary_monthly + 3
                },
                'url': '#',
                'skills': job_skills_list
            })
            
        return similar_jobs


# Singleton instance
prediction_service = SalaryPredictionService() 