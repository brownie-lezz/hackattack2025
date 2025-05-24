import MotionBox from "../../../utils/motion";
import { fadeIn } from "../../../utils/motionVariants";

const ScrapedJobItem = ({ job }) => {
  return (
    <MotionBox variants={fadeIn("up", "spring", 0.2, 0.5)}>
      <div className="job-item p-4 mb-4">
        <div className="row g-4">
          <div className="col-sm-12 col-md-8 d-flex align-items-center">
            <img
              className="flex-shrink-0 img-fluid border rounded"
              src={job.logo_url}
              alt="company"
              style={{ width: "100px", height: "100px" }}
            />
            <div className="text-start ps-4">
              <h5 className="mb-3">{job.title}</h5>
              <div className="mb-2">
                {job.tags.map((tag, index) => {
                  return (
                    <span
                      className="badge bg-secondary"
                      key={index}
                      style={{ marginRight: 5 }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
              <span className="text-truncate me-3">
                <i className="fa fa-solid fa-user-tie text-success me-2"></i>
                {job.company}
              </span>
              <span className="text-truncate me-3">
                <i className="fa fa-map-marker-alt text-success me-2"></i>
                {job.location}
              </span>
              {job.salary !== "nan" && (
                <span className="text-truncate me-0">
                  <i className="far fa-money-bill-alt text-success me-2"></i>
                  {job.salary}
                </span>
              )}
            </div>
          </div>

          <div className="col-sm-12 col-md-4 d-flex flex-column align-items-start align-items-md-end justify-content-center">
            <div className="d-flex mb-3 applyScrapped">
              <a
                href={job.url}
                className="btn btn-outline-success"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Job
              </a>
            </div>
            {job.deadline !== "nan" && (
              <small className="text-truncate">
                <i className="far fa-calendar-alt text-success me-2"></i>
                Deadline: {job.deadline}
              </small>
            )}
          </div>
        </div>
      </div>
    </MotionBox>
  );
};

export default ScrapedJobItem;
