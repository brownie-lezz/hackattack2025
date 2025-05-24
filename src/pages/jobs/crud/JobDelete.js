import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axios_instance";
import { urls } from "../../../utils/config";

const JobDelete = () => {
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = () => {
    setIsDeleting(true);
    axiosInstance
      .delete(urls.JOB_UPDATE.replace(":id", id))
      .then(() => {
        setIsDeleting(false);
        navigate(-1);
      })
      .catch((err) => {
        setError(err);
        setIsDeleting(false);
      });
  };

  return (
    <div className="container my-5">
      <div className="card">
        <div className="card-header">Delete Job</div>
        <div className="card-body">
          {error && <p className="text-danger">{error.message}</p>}
          <p>Are you sure you want to delete this job?</p>
          <button
            className="btn btn-danger"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>{" "}
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDelete;
