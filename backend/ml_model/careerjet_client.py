import requests
import json
from typing import Dict, Any, Optional

class CareerjetAPIClient:
    """
    A Python client for the Careerjet API.
    """
    def __init__(self, locale: str = "en_US"):
        """
        Initialize the Careerjet API client.
        
        Args:
            locale (str): The locale to use for the API (e.g., "en_US", "fr_FR").
        """
        self.locale = locale
        self.base_url = "http://public.api.careerjet.net/search"

    def search(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search for jobs using the Careerjet API.
        
        Args:
            params (dict): The search parameters.
                Required parameters:
                - location: The location to search in.
                - keywords: The keywords to search for.
                - affid: Your Careerjet affiliate ID.
                - user_ip: The IP address of the user.
                - url: The URL of the page where the search is being performed.
                - user_agent: The user agent of the browser.
                
                Optional parameters:
                - contracttype: The type of contract (e.g., "permanent", "contract").
                - contractperiod: The period of the contract (e.g., "full_time", "part_time").
                - sort: The sort order (e.g., "date", "salary").
                - start: The starting index for pagination.
                - pagesize: The number of results per page.
                - page: The page number for pagination.
        
        Returns:
            dict: The search results.
        """
        # Add the locale to the parameters
        params["locale_code"] = self.locale
        
        try:
            # Make the API request
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Parse the JSON response
            result = response.json()
            
            # Check if the API returned an error
            if "error" in result:
                raise RuntimeError(f"Careerjet API error: {result['error']}")
            
            return result
            
        except requests.RequestException as e:
            raise RuntimeError(f"Error making request to Careerjet API: {str(e)}")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Error parsing response from Careerjet API: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Unexpected error in Careerjet API client: {str(e)}") 