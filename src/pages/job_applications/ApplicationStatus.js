import { useState } from "react";

import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";

const ApplicationStatus = ({ status, applicationID }) => {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatusChange = (newStatus) => {
    // Update the status using an API call
    axiosInstance
      .patch(urls.JOB_APPLICATION_DETAIL.replace(":id", applicationID), {
        status: newStatus,
      })
      .then(() => {
        console.log(
          `Changed application status of application ${applicationID} to ${newStatus}`
        );

        setCurrentStatus(newStatus);
      })
      .catch((err) => {
        console.error("Error changing application status:", err);
      });
  };

  const statusOptions = [
    "pending",
    "under_review",
    "shortlisted",
    "interview",
    "rejected",
    "hired",
  ];

  let statusClass;
  switch (currentStatus) {
    case "pending":
      statusClass = "btn-secondary";
      break;
    case "under_review":
      statusClass = "btn-info";
      break;
    case "shortlisted":
      statusClass = "btn-primary";
      break;
    case "interview":
      statusClass = "btn-warning";
      break;
    case "rejected":
      statusClass = "btn-danger";
      break;
    case "hired":
      statusClass = "btn-success";
      break;
    default:
      statusClass = "btn-secondary";
  }

  return (
    <div className="dropdown">
      <button
        className={`btn dropdown-toggle ${statusClass}`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </button>

      <ul className="dropdown-menu">
        {statusOptions.map((option, index) => (
          <li key={index}>
            <button
              key={option}
              className="dropdown-item"
              onClick={() => handleStatusChange(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationStatus;
