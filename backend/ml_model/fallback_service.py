"""
Fallback salary prediction service that doesn't require ML dependencies.
Used when the full ML model can't be loaded.
"""
import logging
import random
from pathlib import Path

logger = logging.getLogger(__name__)

class FallbackSalaryPredictionService:
    def __init__(self):
        self.initialized = True
        logger.info("Fallback salary prediction service initialized")
        
    def initialize(self):
        """Always returns True since fallback doesn't need initialization."""
        return True
        
    def predict(self, job_data):
        """
        Generate a fallback salary prediction based on job title and experience.
        
        Args:
            job_data (dict): Job posting data
            
        Returns:
            dict: Prediction result
        """
        logger.info("Using fallback prediction service")
        
        # Base salary ranges by experience level (in thousands)
        salary_ranges = {
            'Internship': (40, 60),
            'Entry level': (60, 85),
            'Associate': (80, 110),
            'Mid-Senior level': (100, 140),
            'Director': (130, 180),
            'Executive': (160, 250)
        }
        
        # Adjust for job title
        title = job_data.get('title', '').lower()
        title_multiplier = 1.0
        
        if any(term in title for term in ['senior', 'lead', 'architect']):
            title_multiplier = 1.25
        elif any(term in title for term in ['manager', 'head', 'director']):
            title_multiplier = 1.4
        elif any(term in title for term in ['junior', 'associate']):
            title_multiplier = 0.85
        
        # Get experience level or default to mid-level
        experience = job_data.get('formatted_experience_level', 'Associate')
        base_min, base_max = salary_ranges.get(experience, salary_ranges['Associate'])
        
        # Apply title multiplier
        yearly_min = base_min * title_multiplier
        yearly_max = base_max * title_multiplier
        
        # Generate a salary value in the range
        yearly_salary = random.uniform(yearly_min, yearly_max) * 1000
        
        # Format as monthly or yearly
        as_monthly = job_data.get('as_monthly', True)
        monthly_salary = yearly_salary / 12
        
        if as_monthly:
            estimated_salary = f"${monthly_salary:,.2f}/month"
        else:
            estimated_salary = f"${yearly_salary:,.2f}/year"
            
        # Format response with both yearly and monthly values
        result = {
            "success": True,
            "estimatedSalary": estimated_salary,
            "yearly": f"${yearly_salary:,.2f}/year",
            "monthly": f"${monthly_salary:,.2f}/month",
            "salaryValue": round(yearly_salary/1000),  # In thousands
            "fallback": True  # Indicate this is a fallback prediction
        }
        
        return result
            
    def get_similar_jobs(self, job_data):
        """
        Generate fallback similar job listings
        
        Args:
            job_data (dict): Job posting data
            
        Returns:
            list: Similar job listings
        """
        # Mock data for similar jobs
        companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Netflix']
        locations = ['New York', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Remote']
        skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']
        
        title = job_data.get('title', 'Software Engineer')
        location = job_data.get('location', 'Remote')
        job_skills = job_data.get('skills', [])
        
        # Generate 3 mock job listings
        similar_jobs = []
        for i in range(3):
            # Pick a random set of skills (2-4)
            if job_skills and isinstance(job_skills, list):
                num_skills = min(4, max(2, len(job_skills)))
                job_skills_list = job_skills[:num_skills]
            else:
                job_skills_list = random.sample(skills, min(3, len(skills)))
                
            # Generate monthly salary range
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
                'skills': job_skills_list,
                'fallback': True  # Indicate this is fallback data
            })
            
        return similar_jobs


# Singleton instance
fallback_service = FallbackSalaryPredictionService() 