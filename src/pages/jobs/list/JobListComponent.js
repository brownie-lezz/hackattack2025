import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";
import Spinner from "../../../components/Spinner";
import Pagination from "./Pagination";
import JobItem from "./JobItem";
import "../jobs.css";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsLoading(true);
    axiosInstance
      .get(jobListUrl)
      .then((res) => {
        // console.table("Jobs:", res.data);
        console.log(`Fetched ${res.data.length} jobs`);
        setJobs(res.data);
        setFilteredJobs(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, [jobListUrl]);

  // Get current posts
  const indexofLastJob = currentPage * jobsPerPage;
  const indexofFirstJob = indexofLastJob - jobsPerPage;
  const currentJobs = filteredJobs
    ? filteredJobs.slice(indexofFirstJob, indexofLastJob)
    : [];

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search input change
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    if (searchTerm === "") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(
        jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm)
        )
      );
    }
  };

  if (isLoading) return <Spinner />;

  if (jobs.length === 0) {
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
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Job Title or Company Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="icon-search">
          <i className="bi bi-search"></i>
        </div>
      </div>
      {currentJobs.map((job, index) => (
        <JobItem key={index} job={job} jobType={jobType} />
      ))}
      <Pagination
        jobsPerPage={jobsPerPage}
        totalJobs={filteredJobs.length}
        paginate={paginate}
      />
    </div>
  );
};

export default JobListComponent;
