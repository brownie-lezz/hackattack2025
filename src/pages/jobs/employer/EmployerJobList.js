import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";
import EmployerJobItem from "./EmployerJobItem";
import Spinner from "../../../components/Spinner";

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

  return (
    <div className="container-fluid py-5 px-5">
      <h2 className="mb-2 page-title">Jobs at {jobs[0].company}</h2>
      {jobs.map((job, index) => {
        return <EmployerJobItem key={index} job={job} />;
      })}
    </div>
  );
};

export default EmployerJobList;
