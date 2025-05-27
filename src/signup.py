import json
import os
import datetime

# Path to the JSON file
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

def signup_user(role, name, email, password, **additional_details):
    """
    Add a new user to the users.json file.
    
    Args:
        role (str): Either 'seeker' or 'employer'
        name (str): Full name for seeker, Company name for employer
        email (str): The email address of the new user
        password (str): The password of the new user
        additional_details (dict): Additional user details specific to their role
        
    Returns:
        bool: True if signup was successful, False otherwise.
    """
    try:
        # Validate role
        if role not in ['seeker', 'employer']:
            print("Invalid role. Must be either 'seeker' or 'employer'")
            return False

        # Check if the file exists, if not create it with an empty list
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'w') as f:
                json.dump([], f)
        
        # Read existing users
        with open(USERS_FILE, 'r') as f:
            users = json.load(f)
        
        # Check if email already exists
        for user in users:
            if user['email'] == email:
                print("Email already exists.")
                return False
        
        # Create new user dictionary with role-specific details
        new_user = {
            'role': role,
            'name': name,  # Full name for seeker, Company name for employer
            'email': email,
            'password': password,  # Note: In a real application, you should hash the password!
            'created_at': str(datetime.datetime.now()),  # Add timestamp for when user was created
        }

        # Add role-specific fields
        if role == 'seeker':
            new_user.update({
                'full_name': name,
                'job_title': additional_details.get('job_title', ''),
                'experience': additional_details.get('experience', ''),
                'skills': additional_details.get('skills', []),
                'location': additional_details.get('location', ''),
                'phone': additional_details.get('phone', ''),
                'resume_url': additional_details.get('resume_url', '')
            })
        else:  # employer
            new_user.update({
                'company_name': name,
                'industry': additional_details.get('industry', ''),
                'company_size': additional_details.get('company_size', ''),
                'company_website': additional_details.get('company_website', ''),
                'company_location': additional_details.get('company_location', ''),
                'company_description': additional_details.get('company_description', ''),
                'contact_person': additional_details.get('contact_person', ''),
                'phone': additional_details.get('phone', '')
            })
        
        # Add new user to the list
        users.append(new_user)
        
        # Write updated users list back to the file
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=4)
        
        print(f"{role.capitalize()} {name} signed up successfully!")
        return True
        
    except Exception as e:
        print(f"An error occurred during signup: {e}")
        return False

# Example usage
if __name__ == "__main__":
    # Example seeker signup
    seeker_details = {
        'job_title': 'Software Developer',
        'experience': '3 years',
        'skills': ['Python', 'JavaScript', 'React'],
        'location': 'New York',
        'phone': '123-456-7890',
        'resume_url': 'https://example.com/resume.pdf'
    }
    signup_user(
        role='seeker',
        name='John Doe',
        email='john@example.com',
        password='password123',
        **seeker_details
    )

    # Example employer signup
    employer_details = {
        'industry': 'Technology',
        'company_size': '50-100',
        'company_website': 'https://example.com',
        'company_location': 'San Francisco',
        'company_description': 'Leading tech company',
        'contact_person': 'Jane Smith',
        'phone': '987-654-3210'
    }
    signup_user(
        role='employer',
        name='Tech Solutions Inc',
        email='hr@techsolutions.com',
        password='company123',
        **employer_details
    ) 