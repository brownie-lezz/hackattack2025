import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";
import EmployerJobItem from "./EmployerJobItem";
import Spinner from "../../../components/Spinner";
import { Link } from "react-router-dom";

const EmployerJobList = () => {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(urls.EMPLOYER_JOBS)
      .then((res) => {
        // console.table("Jobs:", res.data);
        setJobs(res.data);        
      })
      .catch((err) => console.log(err));
  }, []);

  if (!jobs) return <Spinner />;

  // Add a button for AI-powered job creation
  const createJobButtons = (
    <div className="d-flex gap-2">
      <Link to="/jobs/create" className="btn btn-primary">
        <i className="bi bi-plus-circle me-1"></i> Create Job
      </Link>
      <Link to="/jobs/create-ai" className="btn btn-success">
        <i className="bi bi-magic me-1"></i> AI-Powered Job Creation
      </Link>
    </div>
  );

  return (
    <div className="container-fluid py-5 px-5">
      <h2 className="mb-2 page-title">Jobs at {jobs[0].company}</h2>
      {createJobButtons}
      {jobs.map((job, index) => {
        return <EmployerJobItem key={index} job={job} />;
      })}
    </div>
  );
};

export default EmployerJobList;
