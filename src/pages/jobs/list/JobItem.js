import { Link } from "react-router-dom";

import Bookmark from "../bookmarks/Bookmark";
import MotionBox from "../../../utils/motion";
import { fadeIn } from "../../../utils/motionVariants";

const JobItem = ({ job, jobType }) => {
  return (
    <MotionBox variants={fadeIn("up", "spring", 0.2, 0.75)}>
      <div className="job-item p-4 mb-4">
        <div className="row g-4">
          <div className="col-sm-12 col-md-8 ps-4">
            {/* <img
              className="flex-shrink-0 img-fluid border rounded"
              src={job.logo_url}
              alt="company"
              style={{ width: "100px", height: "100px" }}
            /> */}
            <div className="text-start">
              <h5 className="mb-3">{job.title}</h5>
              <div className="mb-2">
                <Link
                  to={`/profile/employer/${job.posted_by}`}
                  className="btn btn-sm btn-secondary"
                >
                  {job.company}
                </Link>
              </div>
              <span className="text-truncate me-3">
                <i className="fa fa-solid fa-user-tie text-success me-2"></i>
                {job.job_level}
              </span>
              <span className="text-truncate me-3">
                <i className="fa fa-map-marker-alt text-success me-2"></i>
                {job.location}
              </span>
              <span className="text-truncate me-0">
                <i className="far fa-money-bill-alt text-success me-2"></i>
                {job.salary_range}
              </span>
            </div>

            <div className="my-3">
              <span className="fw-bold">Skills:</span>
              <span className="lead"> {job.skill_required}</span>
            </div>

            {/* Display description if it's Recommendations page */}
            {jobType === "RECOMMENDED" && (
              <div className="small text-muted">
                {job.description.substring(0, 250)}...
              </div>
            )}
          </div>

          <div className="col-sm-12 col-md-4 d-flex flex-column align-items-start align-items-md-end justify-content-center">
            {/* Display similarity score if it's Recommendations page */}
            {jobType === "RECOMMENDED" && (
              <div className="float-end btn btn-primary mb-3">
                {job.similarity_scores} %
              </div>
            )}

            <div className="d-flex align-items-center mb-3">
              <Bookmark jobID={job.id} jobType={jobType} />

              <Link to={`/jobs/${job.id}`} className="btn btn-outline-success">
                View Job
              </Link>
            </div>
            <small className="text-truncate">
              <i className="far fa-calendar-alt text-success me-2"></i>Deadline:{" "}
              {jobType === "RECOMMENDED"
                ? job.deadline
                : job.deadline_remaining}
            </small>
          </div>
        </div>
      </div>
    </MotionBox>
  );
};

export default JobItem;
