import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./jobapplication.css";

import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";

import ApplicationStatus from "./ApplicationStatus";

const JobApplicationsList = () => {
  const [applications, setApplications] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    axiosInstance
      .get(urls.JOB_APPLICATIONS_LIST.replace(":job_id", id))
      .then((res) => {
        // console.table("Job applications:", res.data);
        setApplications(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleDownload = () => {
    setIsDownloading(true);
    axiosInstance
      .get(urls.JOB_APPLICATIONS_LIST_DOWNLOAD.replace(":job_id", id), {
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data]);

        // Create a link element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `job_applications_job_${id}.xlsx`;
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Remove the link element
        document.body.removeChild(link);
        console.log("Excel File downloaded successfully!");
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      })
      .finally(() => setIsDownloading(false));
  };

  if (!applications || applications.length === 0)
    return <div className="display-6 text-center my-5">No applications!</div>;

  return (
    <div className="whole-table">
      <div className="main-table container-fluid py-5 px-5">
        <div className="table-div">
          <div className="display-6 mb-4 text-center page-title fs-1">
            Job Applications for {applications[0].job_title}
          </div>
          <div className="ms-2 ms-md-4">
            <Link
              to={`/jobs/${id}/applicant-ranking`}
              className="btn btn-outline-success me-2"
            >
              Parse resumes and Rank Applicants
            </Link>

            {/* Download Excel File */}
            {isDownloading ? (
              <button className="btn btn-primary" type="button" disabled>
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                <span role="status">Downloading...</span>
              </button>
            ) : (
              <button
                className="btn btn-outline-primary"
                onClick={handleDownload}
              >
                Download Excel
                <i className="bi bi-download ms-2"></i>
              </button>
            )}
          </div>

          <div className="table__body">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  {/* <th>Message</th> */}
                  <th>Applied Date</th>
                  <th>Resume</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <a href={`/profile/seeker/${application.seeker_id}`}>
                          {application.name}
                        </a>
                      </td>
                      <td>{application.email}</td>
                      <td>{application.phone_number}</td>
                      <td>{application.created_at.substring(0, 10)}</td>
                      <td>
                        {application.resume ? (
                          <a
                            href={application.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-success text-light"
                          >
                            Resume
                          </a>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td>
                        <ApplicationStatus
                          status={application.status}
                          applicationID={application.id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationsList;
