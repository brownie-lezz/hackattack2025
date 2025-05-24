const ApplicationStatusDisabled = ({ status }) => {
  let statusClass;
  switch (status) {
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
    <button className={`btn ${statusClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

export default ApplicationStatusDisabled;
