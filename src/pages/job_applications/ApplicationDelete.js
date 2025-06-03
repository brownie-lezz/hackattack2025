import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";

const ApplicationDelete = ({ applicationID }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    axiosInstance
      .delete(urls.JOB_APPLICATION_DETAIL.replace(":id", applicationID))
      .then(() => {
        navigate(0);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div
      className="modal fade"
      id="delApplicationModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Are you sure?
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body lead">
            Do you really want to delete this record? This process cannot be
            undone.
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDelete;
