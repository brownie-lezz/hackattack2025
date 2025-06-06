from pathlib import Path
import pandas as pd
import cloudpickle
import sys
import os
import traceback
from .multi_layer_perceptron import CustomNeuralNetRegressor, Model, TensorTransformer
import socket
from .careerjet_client import CareerjetAPIClient
from . import salary

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
                return False
            
            # Temporarily add the current module's directory to sys.path
            # to help cloudpickle find the custom 'salary' module if it was pickled as a top-level module.
            module_dir_path = str(self._current_dir) # self._current_dir is Path(__file__).parent
            sys.path.insert(0, module_dir_path)

            # Load preprocessor
            try:
                with open(preprocessor_path, 'rb') as f:
                    self.preprocessor = cloudpickle.load(f)
            finally:
                # Always remove the path after attempting to load, to avoid polluting sys.path
                if sys.path[0] == module_dir_path:
                    sys.path.pop(0)

            # Initialize neural network
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
            
            # Load model parameters
            self.model.load_params(str(model_path))
            
            # Load company industries data
            df_company_industries = pd.read_csv(industries_path)
            self.company_industries = df_company_industries.iloc[:, 0].tolist()
            
            self.initialized = True
            return True
            
        except Exception as e:
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
            
            # Calculate market trends and insights
            experience_level = job_data.get('formatted_experience_level', 'Entry level')
            industry = job_data.get('company_industries', 'Technology')
            education = job_data.get('education_requirement', '')
            location = job_data.get('location', 'Remote')
            skills = job_data.get('skill_requirement', '').split(',')
            remote = job_data.get('remote_allowed', False)
            company_size = job_data.get('company_employee_count', 500)
            
            # Determine market trend based on experience level and industry
            trend = 'stable'
            if experience_level in ['Senior', 'Lead', 'Manager']:
                trend = 'up'
            elif experience_level == 'Entry level':
                trend = 'down'
            
            # Calculate education impact
            education_impact = 0
            if 'Master' in education:
                education_impact = 20
            elif 'Bachelor' in education:
                education_impact = 15
            elif 'PhD' in education:
                education_impact = 30
            
            # Determine job availability
            availability = 70  # Default value
            if industry == 'Technology':
                availability = 85
            elif industry == 'Healthcare':
                availability = 90
            elif industry == 'Finance':
                availability = 75
            
            # Determine competition level (1-5)
            competition = 3  # Default value
            if experience_level == 'Entry level':
                competition = 4
            elif experience_level in ['Senior', 'Lead']:
                competition = 2
            
            # Extract top skills from the job data
            top_skills = [skill.strip() for skill in skills if skill.strip()][:5]
            
            # Calculate salary factors
            salary_factors = []
            
            # Location impact
            location_impact = 0
            if 'New York' in location or 'San Francisco' in location or 'Seattle' in location:
                location_impact = 20
                salary_factors.append("High cost of living area (+20%)")
            elif 'Remote' in location:
                location_impact = -10
                salary_factors.append("Remote position (-10%)")
            
            # Industry impact
            industry_impact = 0
            if industry == 'Technology':
                industry_impact = 15
                salary_factors.append("Technology industry premium (+15%)")
            elif industry == 'Finance':
                industry_impact = 10
                salary_factors.append("Finance industry premium (+10%)")
            
            # Experience impact
            experience_impact = 0
            if experience_level == 'Senior':
                experience_impact = 25
                salary_factors.append("Senior level position (+25%)")
            elif experience_level == 'Lead':
                experience_impact = 35
                salary_factors.append("Lead position (+35%)")
            elif experience_level == 'Manager':
                experience_impact = 40
                salary_factors.append("Manager position (+40%)")
            
            # Company size impact
            company_size_impact = 0
            if company_size > 1000:
                company_size_impact = 10
                salary_factors.append("Large company premium (+10%)")
            elif company_size < 50:
                company_size_impact = -5
                salary_factors.append("Small company adjustment (-5%)")
            
            # Calculate total impact
            total_impact = location_impact + industry_impact + experience_impact + company_size_impact
            
            # Format response with both yearly and monthly values
            result = {
                "success": True,
                "estimatedSalary": estimated_salary,
                "yearly": f"${yearly_salary:,.2f}/year",
                "monthly": f"${yearly_salary/12:,.2f}/month",
                "salaryValue": round(yearly_salary/1000),  # In thousands
                "trend": trend,
                "educationImpact": education_impact,
                "availability": availability,
                "competition": competition,
                "topSkills": top_skills,
                "salaryFactors": salary_factors,
                "totalImpact": total_impact,
                "locationImpact": location_impact,
                "industryImpact": industry_impact,
                "experienceImpact": experience_impact,
                "companySizeImpact": company_size_impact
            }
            
            return result
            
        except Exception as e:
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
            except Exception:
                local_ip = '127.0.0.1'
            
            # Create search query
            search_params = {
                'location': location or 'USA',
                'keywords': title + (", " + keywords if keywords else ""),
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
            
            # Check if the API call was successful
            if not result_json or 'jobs' not in result_json:
                raise RuntimeError("No jobs found or invalid response from Careerjet API")
            
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
                                except ValueError:
                                    pass
                    
                    # Extract skills from description if available
                    skills = []
                    if 'description' in job and job['description']:
                        # Simple skill extraction - in production, use a more sophisticated approach
                        common_skills = ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Angular', 'Vue', 'Node.js', 
                                       'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'Machine Learning', 
                                       'AI', 'Data Science', 'DevOps', 'Agile', 'Scrum']
                        for skill in common_skills:
                            if skill.lower() in job['description'].lower():
                                skills.append(skill)
                    
                    # Create job object with all available information
                    job_obj = {
                        'title': job.get('title', ''),
                        'company': job.get('company', ''),
                        'location': job.get('locations', ''),
                        'url': job.get('url', ''),  # Make sure to include the URL
                        'description': job.get('description', ''),
                        'skills': skills[:5],  # Limit to top 5 skills
                    }
                    
                    # Add salary if available
                    if salary_min is not None and salary_max is not None:
                        job_obj['salary'] = {
                            'min': salary_min,
                            'max': salary_max
                        }
                    
                    similar_jobs.append(job_obj)
            
            return similar_jobs
            
        except Exception as e:
            raise RuntimeError(f"Error getting similar jobs: {str(e)}")


# Singleton instance
prediction_service = SalaryPredictionService() 