import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SalaryInsightsForm from './SalaryInsightsForm';
import { createInitialJob } from '../types/Job';
import axiosInstance from '../utils/axios_instance';
import { urls } from '../utils/config';
import './JobCreationWizard.css';

// Define wizard steps
const STEPS = [
  { id: 'details', name: 'Job Details' },
  { id: 'requirements', name: 'Requirements' },
  { id: 'salary', name: 'Salary Insights' },
  { id: 'preview', name: 'Preview' }
];

const JobCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [job, setJob] = useState(createInitialJob());
  const navigate = useNavigate();

  // Update job data
  const handleChange = (field, value) => {
    setJob(prev => ({ ...prev, [field]: value }));
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Add item to an array field (skills, responsibilities, qualifications)
  const handleAddItem = (field, item) => {
    if (item && !job[field].includes(item)) {
      handleChange(field, [...job[field], item]);
    }
  };

  // Remove item from an array field
  const handleRemoveItem = (field, index) => {
    const newItems = [...job[field]];
    newItems.splice(index, 1);
    handleChange(field, newItems);
  };

  // Save job (as draft or published)
  const handleSaveJob = async (status) => {
    const jobData = {
      ...job,
      status
    };
    
    try {
      const response = await axiosInstance.post(urls.JOB_CREATE, jobData);
      console.log("Job saved:", response.data);
      navigate('/jobs/employer');
    } catch (error) {
      console.error("Error saving job:", error);
      alert("There was an error saving the job. Please try again.");
    }
  };

  // Render job details step
  const renderJobDetailsStep = () => (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title mb-4">Job Details</h3>
        
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Job Title*</label>
          <input 
            type="text" 
            className="form-control" 
            id="title" 
            name="title" 
            value={job.title} 
            onChange={handleInputChange}
            required 
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Job Description*</label>
          <textarea 
            className="form-control" 
            id="description" 
            name="description" 
            rows="5" 
            value={job.description} 
            onChange={handleInputChange}
            required 
          ></textarea>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="department" className="form-label">Department</label>
            <input 
              type="text" 
              className="form-control" 
              id="department" 
              name="department" 
              value={job.department} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="location" className="form-label">Location</label>
            <input 
              type="text" 
              className="form-control" 
              id="location" 
              name="location" 
              value={job.location} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="type" className="form-label">Job Type</label>
            <select 
              className="form-select" 
              id="type" 
              name="type" 
              value={job.type} 
              onChange={handleInputChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="experience" className="form-label">Experience Level</label>
            <select 
              className="form-select" 
              id="experience" 
              name="experience" 
              value={job.experience} 
              onChange={handleInputChange}
            >
              <option value="Internship">Internship</option>
              <option value="Entry-Level">Entry-Level</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render requirements step
  const renderRequirementsStep = () => {
    const [newSkill, setNewSkill] = useState('');
    const [newResponsibility, setNewResponsibility] = useState('');
    const [newQualification, setNewQualification] = useState('');

    return (
      <div className="card">
        <div className="card-body">
          <h3 className="card-title mb-4">Job Requirements</h3>
          
          {/* Skills */}
          <div className="mb-4">
            <label className="form-label">Skills</label>
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Add a skill" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('skills', newSkill);
                    setNewSkill('');
                  }
                }}
              />
              <button 
                className="btn btn-outline-primary" 
                type="button"
                onClick={() => {
                  handleAddItem('skills', newSkill);
                  setNewSkill('');
                }}
              >
                Add
              </button>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <div key={index} className="badge bg-primary d-flex align-items-center p-2">
                  {skill}
                  <button 
                    type="button" 
                    className="btn-close btn-close-white ms-2"
                    onClick={() => handleRemoveItem('skills', index)}
                    aria-label="Remove"
                  ></button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Responsibilities */}
          <div className="mb-4">
            <label className="form-label">Responsibilities</label>
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Add a responsibility" 
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('responsibilities', newResponsibility);
                    setNewResponsibility('');
                  }
                }}
              />
              <button 
                className="btn btn-outline-primary" 
                type="button"
                onClick={() => {
                  handleAddItem('responsibilities', newResponsibility);
                  setNewResponsibility('');
                }}
              >
                Add
              </button>
            </div>
            
            <ul className="list-group">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {responsibility}
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => handleRemoveItem('responsibilities', index)}
                    aria-label="Remove"
                  ></button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Qualifications */}
          <div className="mb-4">
            <label className="form-label">Qualifications</label>
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Add a qualification" 
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('qualifications', newQualification);
                    setNewQualification('');
                  }
                }}
              />
              <button 
                className="btn btn-outline-primary" 
                type="button"
                onClick={() => {
                  handleAddItem('qualifications', newQualification);
                  setNewQualification('');
                }}
              >
                Add
              </button>
            </div>
            
            <ul className="list-group">
              {job.qualifications.map((qualification, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  {qualification}
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => handleRemoveItem('qualifications', index)}
                    aria-label="Remove"
                  ></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render salary insights step
  const renderSalaryInsightsStep = () => (
    <SalaryInsightsForm formData={job} onChange={handleChange} />
  );

  // Render job preview step
  const renderPreviewStep = () => (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title mb-4">Job Preview</h3>
        
        <div className="p-4 border rounded bg-light mb-4">
          <h2 className="mb-3">{job.title || "Job Title"}</h2>
          
          <div className="d-flex flex-wrap gap-3 mb-3">
            {job.department && (
              <span className="badge bg-secondary">{job.department}</span>
            )}
            {job.location && (
              <span className="badge bg-secondary">{job.location}</span>
            )}
            {job.type && (
              <span className="badge bg-secondary">{job.type}</span>
            )}
            {job.experience && (
              <span className="badge bg-secondary">{job.experience}</span>
            )}
            {job.salary && job.salary.min > 0 && job.salary.max > 0 && (
              <span className="badge bg-success">
                ${job.salary.min}k - ${job.salary.max}k {job.salary.isMonthly ? '/month' : '/year'}
              </span>
            )}
          </div>
          
          <div className="mb-4">
            <h5>Description</h5>
            <p>{job.description || "No description provided."}</p>
          </div>
          
          {job.skills.length > 0 && (
            <div className="mb-4">
              <h5>Required Skills</h5>
              <div className="d-flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="badge bg-primary">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          {job.responsibilities.length > 0 && (
            <div className="mb-4">
              <h5>Responsibilities</h5>
              <ul>
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </div>
          )}
          
          {job.qualifications.length > 0 && (
            <div>
              <h5>Qualifications</h5>
              <ul>
                {job.qualifications.map((qualification, index) => (
                  <li key={index}>{qualification}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="d-flex justify-content-center gap-3">
          <button 
            className="btn btn-outline-primary"
            onClick={() => handleSaveJob('Draft')}
          >
            Save as Draft
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleSaveJob('Published')}
          >
            Publish Job
          </button>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderJobDetailsStep();
      case 1:
        return renderRequirementsStep();
      case 2:
        return renderSalaryInsightsStep();
      case 3:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  // Validation for the current step
  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Job details
        return !!job.title && !!job.description;
      case 1: // Requirements
        return job.skills.length > 0;
      case 2: // Salary insights
        return true; // Always allow proceeding
      default:
        return true;
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="mb-4">
        <h2>Create New Job</h2>
        <p className="text-muted">Fill in the details to create a new job posting</p>
      </div>
      
      {/* Progress steps */}
      <div className="mb-4">
        <div className="d-flex justify-content-between steps">
          {STEPS.map((step, index) => (
            <div 
              key={index}
              className={`step-item ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'complete' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
            >
              <div 
                className="step-circle"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                style={{ cursor: index <= currentStep ? 'pointer' : 'not-allowed' }}
              >
                {index + 1}
              </div>
              <div className="step-text mt-2">{step.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <div className="mb-4">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-secondary"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </button>
        
        {currentStep < STEPS.length - 1 ? (
          <button 
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {currentStep === 2 ? 'Preview' : 'Next'}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default JobCreationWizard; 