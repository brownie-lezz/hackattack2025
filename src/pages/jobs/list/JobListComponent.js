import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";
import Spinner from "../../../components/Spinner";
import Pagination from "./Pagination";
import JobItem from "./JobItem";
import "../jobs.css";
import { getJobs } from "../../../utils/jobService";

const JobListComponent = ({ jobType }) => {
  let jobListUrl, pageTitle;
  if (jobType === "ALL") {
    jobListUrl = urls.JOB_LIST;
    pageTitle = "All Jobs List";
  } else if (jobType === "RECOMMENDED") {
    jobListUrl = urls.JOB_RECOMMENDED;
    pageTitle = "Jobs Recommended for you";
  } else if (jobType === "BOOKMARK") {
    jobListUrl = urls.JOB_BOOKMARK_LIST;
    pageTitle = "Saved Jobs";
  }

  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (jobType === "ALL") {
      getJobs()
        .then((response) => {
          if (response.success) {
            console.log(`Fetched ${response.data.length} jobs from Supabase`);
            setJobs(response.data);
            setFilteredJobs(response.data);
          } else {
            console.error("Failed to fetch jobs from Supabase:", response.error);
            setError(response.error?.message || "Failed to fetch jobs. Please try again later.");
            setJobs([]);
            setFilteredJobs([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching jobs from Supabase:", err);
          setError(err.message || "An unexpected error occurred while fetching jobs.");
          setJobs([]);
          setFilteredJobs([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      axiosInstance
        .get(jobListUrl)
        .then((res) => {
          console.log(`Fetched ${res.data.length} jobs via axios for ${jobType}`);
          setJobs(res.data);
          setFilteredJobs(res.data);
        })
        .catch((err) => {
          console.log(err);
          setError(err.message || `Failed to fetch ${jobType} jobs.`);
          setJobs([]);
          setFilteredJobs([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [jobType, jobListUrl]);

  const indexofLastJob = currentPage * jobsPerPage;
  const indexofFirstJob = indexofLastJob - jobsPerPage;
  const currentJobs = filteredJobs
    ? filteredJobs.slice(indexofFirstJob, indexofLastJob)
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (event) => {
    const searchTermValue = event.target.value.toLowerCase();
    setSearchTerm(searchTermValue);
    setCurrentPage(1);

    if (searchTermValue === "") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(
        jobs.filter(
          (job) =>
            (job.title && job.title.toLowerCase().includes(searchTermValue)) ||
            (job.company_name && job.company_name.toLowerCase().includes(searchTermValue)) ||
            (job.location && job.location.toLowerCase().includes(searchTermValue)) ||
            (job.skills && Array.isArray(job.skills) && job.skills.some(skill => skill.toLowerCase().includes(searchTermValue)))
        )
      );
    }
  };

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="container-fluid py-5 px-5">
        <h2 className="text-center mb-5 page-title fs-1">{pageTitle}</h2>
        <div className="alert alert-danger text-center" role="alert">
          <h4>Error Fetching Jobs</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="container-fluid py-5 px-5">
        <h2 className="text-center mb-5 page-title fs-1">{pageTitle}</h2>
        <h4 className="text-center fs-2">No jobs found!</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5 px-5">
      <h2 className="text-center mb-5 page-title fs-1">{pageTitle}</h2>
      <div className="search-box mb-4">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search by Job Title, Company, Location, or Skill..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {currentJobs.length > 0 ? (
        currentJobs.map((job) => (
          <JobItem key={job.id || job._id || Math.random()} job={job} jobType={jobType} />
        ))
      ) : (
        <div className="text-center mt-4">
          <p className="fs-5 text-muted">No jobs match your current search criteria.</p>
        </div>
      )}
      {filteredJobs.length > jobsPerPage && (
        <Pagination
          jobsPerPage={jobsPerPage}
          totalJobs={filteredJobs.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default JobListComponent;
