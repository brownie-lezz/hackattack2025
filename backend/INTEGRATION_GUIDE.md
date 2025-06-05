# Job Creation AI Integration Guide

This guide will help you set up and use the integrated job creation and salary prediction system.

## Setup Instructions

### 1. Install Dependencies

Install the required Python dependencies:

```bash
# Create and activate virtual environment (if needed)
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix/MacOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Backend API

Start the backend API service:

```bash
# Start the backend service
python main.py
```

This will start the backend API on port 8000.

### 3. Start the Frontend Application

In a separate terminal, start the frontend React application:

```bash
# From the project root
cd src

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

This will start the frontend application on port 3000 (or whatever port is configured in your setup).

