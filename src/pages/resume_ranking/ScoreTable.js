import ApplicationStatus from "../job_applications/ApplicationStatus";

const ScoreTable = ({ resumeRankings }) => {
  return (
    <div className="whole-table">
      <div className="main-table container-fluid py-5 px-5">
        <div className="table-div">
          <div className="display-6 mb-4 text-center page-title fs-1">
            Applicant Rankings
          </div>
          <div className="table__body">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Applicant</th>
                  <th>Description Score</th>
                  <th>Education Score</th>
                  <th>Experience Score</th>
                  <th>Projects Score</th>
                  <th>Skills Score</th>
                  <th>Total Score</th>
                  <th>Resume</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resumeRankings.map((resume, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{resume.name}</td>
                    <td>{resume.description_score}</td>
                    <td>{resume.education_score}</td>
                    <td>{resume.experience_score}</td>
                    <td>{resume.projects_score}</td>
                    <td>{resume.skills_score}</td>
                    <td>{resume.total_score}</td>
                    <td>
                      {resume.resume_url ? (
                        <a
                          href={`http://127.0.0.1:8000/${resume.resume_url}`}
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
                        status={resume.status}
                        applicationID={resume.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreTable;
