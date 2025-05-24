import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { urls } from "../../../utils/config";
import axiosInstance from "../../../utils/axios_instance";
import { MyTextInput, MySelect, MyTextArea } from "../../../components/Inputs";
import {
  JOB_LEVEL_CHOICES,
  EMPLOYMENT_TYPE_CHOICES,
  JOB_NATURE_CHOICES,
} from "./Choices";

const JobUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(urls.JOB_UPDATE.replace(":id", id))
      .then((res) => {
        setJob(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!job) return <h3>Job Not Found</h3>;

  const handleSubmit = (updatedJob) => {
    axiosInstance
      .put(`api/jobs/${id}/update/`, updatedJob)
      .then((res) => {
        console.log("Job updated:", res.data);
        navigate(`/jobs/${id}`);
      })
      .catch((error) => console.log("Form submit error:", error));
  };

  return (
    <div className="contianer mx-5 p-5">
      <h2 className="text-center page-title">Update job</h2>

      {/* Pass initial values, validation and submit funciton */}
      <Formik
        initialValues={{
          title: job.title,
          location: job.location,
          no_of_vacancy: job.no_of_vacancy,
          salary_range: job.salary_range,
          deadline: job.deadline,
          job_level: job.job_level,
          employment_type: job.employment_type,
          job_nature: job.job_nature,
          education_level: job.education_level,
          education_field_of_study: job.education_field_of_study,
          experience_required: job.experience_required,
          skill_required: job.skill_required,
          description: job.description,
        }}
        validationSchema={Yup.object({
          // Basic Information
          title: Yup.string().required("Required"),
          location: Yup.string().required("Required"),
          no_of_vacancy: Yup.number().min(1).required("Required"),
          salary_range: Yup.string().required("Required"),
          deadline: Yup.date().required("Required"),
          // Choice fields
          job_level: Yup.string().required("Job level is required"),
          // .oneOf(JOB_LEVEL_CHOICES.map((level) => level[0]), 'Invalid Job Level'),
          employment_type: Yup.string().required("Employment type is required"),
          job_nature: Yup.string().required("Job location is required"),
          //   Specification
          education_level: Yup.string(),
          education_field_of_study: Yup.string(),
          experience_required: Yup.number().min(0),
          skill_required: Yup.string(),
          //   Additional Description
          description: Yup.string(),
        })}
        onSubmit={(updatedJob) => {
          handleSubmit(updatedJob);
        }}
      >
        <Form className="p-4 border border-2">
          <MyTextInput
            label="Title"
            name="title"
            type="text"
            placeholder="Enter job title"
            required
          />
          <MyTextInput
            label="Location"
            name="location"
            type="text"
            placeholder="Enter the job location"
            required
          />
          <MySelect
            label="Job Level"
            name="job_level"
            options={JOB_LEVEL_CHOICES}
            required
          />

          <MySelect
            label="Employment Type"
            name="employment_type"
            options={EMPLOYMENT_TYPE_CHOICES}
            required
          />

          <MySelect
            label="Job Nature"
            name="job_nature"
            options={JOB_NATURE_CHOICES}
            required
          />

          <MyTextInput
            label="no_of_vacancy"
            name="no_of_vacancy"
            type="number"
            placeholder="Enter number of vacant posts"
            required
          />
          <MyTextInput
            label="Salary Range"
            name="salary_range"
            type="text"
            placeholder="Enter salary range (eg: Rs.50000-Rs.75000)"
            required
          />
          <MyTextInput label="Deadline" name="deadline" type="date" required />

          <MyTextInput
            label="Education Level"
            name="education_level"
            type="text"
            placeholder="Enter required education level (e.g. Bachelor's Degree, Master's Degree)"
          />
          <MyTextInput
            label="Education Field of Study (Major)"
            name="education_field_of_study"
            type="text"
            placeholder="Enter required education field of study (e.g. Computer Engineering, Data Science)"
          />
          <MyTextInput
            label="Experience Required"
            name="experience_required"
            type="number"
            placeholder="Enter required experience in years (e.g. 3, 5)"
          />
          <MyTextInput
            label="Skills Required"
            name="skill_required"
            type="text"
            placeholder="Enter the skills required for the job, separated by commas"
          />
          <MyTextArea
            label="Job Description"
            name="description"
            type="text"
            placeholder="Enter the job description in detail"
          />

          <button type="submit" className="btn btn-success">
            Update
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default JobUpdate;
