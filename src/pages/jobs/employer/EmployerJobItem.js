import { Link } from "react-router-dom";
import MotionBox from "../../../utils/motion";
import { fadeIn } from "../../../utils/motionVariants";

const EmployerJobItem = ({ job }) => {
  return (
    <MotionBox variants={fadeIn("right", "spring", 0.2, 0.75)}>
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

            <div className="text-truncate my-3">
              <i className="far fa-calendar-alt text-success"></i> Deadline:
              {" " + job.deadline}
            </div>

            <div className="d-flex flex-wrap">
              <Link
                to={`/jobs/${job.id}`}
                className="btn btn-outline-success btn-sm mx-1"
              >
                View
              </Link>
              <Link
                to={`/jobs/${job.id}/update`}
                className="btn btn-outline-primary btn-sm mx-1"
              >
                Update
              </Link>
              <Link
                to={`/jobs/${job.id}/delete`}
                className="btn btn-outline-danger btn-sm mx-1"
              >
                Delete
              </Link>
              <Link
                to={`/jobs/${job.id}/applications`}
                className="btn btn-outline-success btn-sm mx-1"
              >
                View Applicants
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MotionBox>
  );
};

export default EmployerJobItem;
