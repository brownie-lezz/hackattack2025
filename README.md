# TalentVerse: An AI-Powered Talent Acquisition System

TalentVerse is an intelligent, full-stack recruitment platform designed to streamline the hiring process. It leverages multiple AI models to automate resume screening, generate interview questions, and provide real-time market analysis, significantly reducing recruiter workload and improving the accuracy of candidate-job matching.

---

## 🎯 Problem Statement

The traditional talent acquisition process is often inefficient due to overwhelming application volumes, spam submissions, and difficulties in matching candidates to roles. This manual process can lead to significant delays, the loss of top talent to competitors, and mismatches between job requirements and compensation. TalentVerse addresses these challenges by introducing a layer of intelligent automation to help recruiters identify the best candidates quickly and effectively.

## ✨ Key Features

-   **🤖 AI-Powered Resume Screening**:
    -   Upload multiple resumes (PDF, DOCX, etc.) and match them against a specific job description.
    -   Leverages a **Mistral LLM** to perform deep semantic analysis of resume content, providing an overall match score and detailed breakdowns for skills, experience, and education.
    -   Identifies missing skills and flags resumes that appear to be AI-generated to help assess authenticity.
    -   Includes an interactive chatbot to ask context-aware questions about the analyzed resume content.

-   **🎙️ Automated AI Interview Bot**:
    -   After passing the initial screening, candidates proceed to an automated video interview.
    -   Utilizes **Google's Gemini AI** to dynamically generate relevant behavioral and technical questions based on the job description.
    -   Presents a one-way interview experience where candidates record their answers, which can be reviewed by recruiters later, saving time and standardizing the initial interview process.

-   **📈 Real-Time Market Analysis**:
    -   Provides AI-powered salary insights based on job title, experience level, and location to help companies offer competitive compensation.
    -   Fetches and displays similar active job postings by performing a semantic search across the web, giving recruiters immediate market context.

## ⚙️ Tech Stack

| Category      | Technology                                                                                                                                                             | Description                                                                                                                                 |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**  | `React`, `Bootstrap`, `CSS`                                                                                                                                            | A responsive and interactive UI built with React, styled with Bootstrap and custom CSS for a modern user experience.                        |
| **Backend**   | `FastAPI` (Python)                                                                                                                                                     | A high-performance Python framework serving as the backend API to handle requests and orchestrate AI-driven tasks.                          |
| **Database**  | `Supabase`                                                                                                                                                             | An open-source Firebase alternative used on the frontend to handle user authentication, session management, and profile data.              |
| **AI/ML**     | `Mistral LLM`, `Gemini AI`, `PyTorch`, `Sentence Transformers`                                                                                                           | A suite of AI models for resume analysis (Mistral), interview question generation (Gemini), salary prediction, and job similarity (PyTorch). |
| **External API**| `Careerjet API`                                                                                                                                                        | An external service integrated into the backend to fetch and display additional job listings from across the web.                           |
| **CI/CD**     | `GitHub`                                                                                                                                                               | The platform used for hosting the project's source code and managing version control with Git.                                              |

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   Node.js and npm
-   Python 3.8+ and pip
-   Git
-   [Ollama](https://ollama.com/) for running the Mistral LLM locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Set up Ollama (if not already done)
# This will download the Mistral model
ollama pull mistral

# Create a .env file in the backend directory and add your API key
touch .env
```

Your `backend/.env` file should contain:

```env
GEMINI_API_KEY="YOUR_GOOGLE_AI_API_KEY"
```

### 3. Frontend Setup

```bash
# Navigate to the project root and then the frontend directory
# (Assuming you are in the backend directory from the previous step)
cd .. 

# Install dependencies
npm install

# Create a .env file in the root directory
touch .env
```

Your root `.env` file for the frontend should contain:

```env
REACT_APP_SUPABASE_URL="YOUR_SUPABASE_URL"
REACT_APP_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 4. Running the Application

1.  **Start the Backend Server**:
    ```bash
    # From the /backend directory
    uvicorn main:app --reload
    ```
    The backend will be running at `http://localhost:8000`.

2.  **Start the Frontend Application**:
    ```bash
    # From the root directory
    npm start
    ```
    The frontend will open and run at `http://localhost:3000`.

## 👥 Target Users

-   **Recruiters & HR Teams**: Companies looking to improve hiring efficiency, reduce the burden of high application volumes, and make data-informed hiring decisions.
-   **Job Seekers**: Candidates who value transparent application processes, personalized job recommendations, and insights into market trends and salary expectations. 
