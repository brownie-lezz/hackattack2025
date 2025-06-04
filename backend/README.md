# Job Creation AI Backend

This is the backend for the Job Creation AI system, which provides salary prediction and similar job recommendations for job postings.

## Directory Structure

```
backend/
├── ml_model/                   # ML model package
│   ├── models/                 # Model files
│   │   ├── preprocessor.cloudpickle
│   │   └── mlp_params.pkl
│   ├── data/                   # Data files
│   │   └── company_industries.csv
│   ├── __init__.py
│   ├── multi_layer_perceptron.py
│   └── salary_service.py
├── job_routes.py               # API routes for jobs
├── main.py                     # Main Flask application
├── copy_model_files.py         # Script to copy model files
├── requirements.txt            # Python dependencies
├── INTEGRATION_GUIDE.md        # Integration guide
└── README.md                   # This file
```

## Migration Process

This backend has been migrated from the original Job Creation AI project to be independent of the original folder structure. The migration process included:

1. Creating a new directory structure for the ML model
2. Copying the necessary ML model files
3. Creating a new service layer for salary predictions
4. Setting up API endpoints for salary prediction and similar jobs
5. Integrating with the existing job creation frontend

## Getting Started

See the [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed setup instructions.

## API Endpoints

- `POST /api/jobs/salary-prediction`: Get salary prediction for a job posting
- `POST /api/jobs/similar-jobs`: Get similar job postings
- `POST /api/jobs/create`: Create a new job posting

## Dependencies

- Python 3.7+
- Flask
- PyTorch
- scikit-learn
- pandas
- cloudpickle

## License

This project is licensed under the MIT License. 