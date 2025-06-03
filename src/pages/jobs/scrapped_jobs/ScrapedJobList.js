import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";
import ScrapedJobItem from "./ScrapedJobItem";
import Pagination from "../list/Pagination";
import Spinner from "../../../components/Spinner";

const ScrapedJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance
      .get(urls.JOB_SCRAPED)
      .then((res) => {
        console.log("Total jobs fetched:", res.data.length);
        setJobs(res.data);
        setFilteredJobs(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  //Get current posts
  const indexofLastJob = currentPage * jobsPerPage;
  const indexofFirstJob = indexofLastJob - jobsPerPage;
  const currentJobs = filteredJobs
    ? filteredJobs.slice(indexofFirstJob, indexofLastJob)
    : [];

  //change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  //Handle search input change
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

  if (jobs.length === 0) return <Spinner />;

  return (
    <div className="container-fluid py-5 px-5">
      <h2 className="text-center mb-5 page-title">Scraped Jobs</h2>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Job Title or Company Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="icon-search">
          <i class="bi bi-search"></i>
        </div>
      </div>
      {currentJobs.map((job, index) => {
        return <ScrapedJobItem key={index} job={job} />;
      })}
      <Pagination
        jobsPerPage={jobsPerPage}
        totalJobs={filteredJobs.length}
        paginate={paginate}
      />
    </div>
  );
};

export default ScrapedJobList;
