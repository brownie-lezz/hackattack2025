import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";

import AuthContext from "../../../context/AuthContext";

import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";

const JobDetail = () => {
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axiosInstance
      .get(urls.JOB_DETAIL.replace(":id", id))
      .then((res) => {
        console.table("Res:", res.data);
        setJob(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!job) return <></>;

  return (
    <div className="container-fluid py-5 px-5">
      <div className="row">
        <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="container">
            <div className="row gy-5 gx-4">
              <h2 className="page-title">{job.company.company_name}</h2>
              <div className="col-lg-8">
                <div className="d-flex align-items-center mb-5">
                  <div className="text-start ps-4">
                    <h3 className="mb-3">{job.title}</h3>
                    <span className="text-truncate me-3">
                      <i className="fa fa-map-marker-alt text-primary me-2"></i>
                      {job.location}
                    </span>
                    <span className="text-truncate me-3">
                      <i className="far fa-clock text-primary me-2"></i>
                      {job.employment_type}
                    </span>
                    <span className="text-truncate me-0">
                      <i className="far fa-money-bill-alt text-primary me-2"></i>
                      {job.salary_range}
                    </span>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="mb-3 p-3 jd-title">Job description</h4>
                  <p>{job.description}</p>

                  <h4 className="mb-3 p-3 jd-title">Job specification</h4>
                  <table>
                    <tbody>
                      <tr>
                        <td className="w-33 p-2">Education level</td>
                        <td className="w-3 p-2">:</td>
                        <td className="w-64 p-2">{job.education_level}</td>
                      </tr>
                      <tr>
                        <td className="w-33 p-2">Experience Required</td>
                        <td className="w-3 p-2">:</td>
                        <td className="w-64 p-2">
                          {job.experience_required} years
                        </td>
                      </tr>
                      <tr>
                        <td className="w-33 p-2">
                          Professional Skill Required
                        </td>
                        <td className="w-3 p-2">:</td>
                        <td className="w-64 p-2">{job.skill_required}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 className="mb-3 p-3 jd-title">Qualifications</h4>
                  <p>
                    The following Qualifications are expected when you apply for
                    the job.
                  </p>
                  <ul className="list-unstyled">
                    <li>
                      <i className="fa fa-angle-right text-primary me-2"></i>At
                      least a {job.education_level} degree holder{" "}
                      {job.education_field_of_study &&
                        `in ${job.education_field_of_study}, or related field`}
                      .
                    </li>
                    <li>
                      <i className="fa fa-angle-right text-primary me-2"></i>A
                      minimum of {job.experience_required} years of experience.
                    </li>
                    <li>
                      <i className="fa fa-angle-right text-primary me-2"></i>
                      Familiarization with {job.skill_required}.
                    </li>
                  </ul>
                </div>
                {user && user.is_employer ? null : (
                  <>
                    <Link
                      to={`/jobs/${id}/apply`}
                      className="btn btn-outline-primary btn-lg me-2"
                    >
                      Apply
                    </Link>
                    <Link
                      to={`/jobs/${id}/ai-examination`}
                      className="btn btn-outline-success btn-lg"
                    >
                      Take AI Examination
                    </Link>
                  </>
                )}
              </div>

              <div className="col-lg-4">
                <div
                  className="bg-light rounded p-5 mb-4 wow slideInUp shadow job-summary"
                  data-wow-delay="0.1s"
                >
                  <h4 className="mb-4">Job Summary</h4>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Vacancy: {job.no_of_vacancy} Position
                  </p>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>Job
                    Nature: {job.employment_type}
                  </p>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Salary: {job.salary_range}
                  </p>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Location: {job.location}
                  </p>
                  <p className="m-0">
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Deadline: {job.deadline}
                  </p>
                </div>
                <div
                  className="bg-light rounded p-5 mb-4 shadow job-summary"
                  data-wow-delay="0.1s"
                >
                  <h4 className="mb-4">Company Detail</h4>
                  <h5 className="display-6">
                    {" "}
                    <Link
                      to={`/profile/employer/${job.posted_by}`}
                      style={{ textDecoration: "none" }}
                    >
                      {job.company.company_name}{" "}
                    </Link>
                  </h5>
                  <p className="text-muted">{job.company.contact_email}</p>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Location: {job.company.company_location}
                  </p>
                  <p>
                    <i className="fa fa-angle-right text-primary me-2"></i>
                    Country: {job.company.country}
                  </p>
                  {job.company.company_description && (
                    <p>
                      {job.company.company_description.substring(0, 200)}...
                    </p>
                  )}
                  <p className="text-center text-primary m-0">
                    <a
                      href={job.company.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-linkedin mx-2"></i>
                    </a>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fa fa-globe mx-2"></i>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
