import "./letter.css";
import React from "react";

const CoverLetter = React.forwardRef(
  ({ profile, date, body, company, activeColor }, ref) => {
    const getFormattedDate = () => {
      const dateArr = date.split("-");
      const dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
      const options = { day: "numeric", month: "long", year: "numeric" };
      const formattedDate = dateObj.toLocaleDateString("en-US", options);
      return formattedDate;
    };

    const activeColorStyle = { color: activeColor };

    return (
      <div className="cover-letter border shadow-regular">
        <div ref={ref} className="container">
          <div className="row p-4">
            <div className="col-12 text-center">
              <h4 style={activeColorStyle}>{profile.name}</h4>
              <h6 className="text-muted">{profile.job_title}</h6>
              <div className="d-flex justify-content-center">
                <div className="mx-2">
                  <i className="bi bi-envelope" style={activeColorStyle}>
                    {"  "}
                  </i>
                  {profile.email}
                </div>
                <div className="mx-2">
                  <i className="bi bi-telephone" style={activeColorStyle}>
                    {"  "}
                  </i>
                  {profile.phone}
                </div>
                <div className="mx-2">
                  <i className="bi bi-geo-alt-fill" style={activeColorStyle}>
                    {"  "}
                  </i>
                  {profile.address}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-end px-4">
              <br />
              <p> {getFormattedDate()}</p>
              <br />
            </div>
          </div>
          {company.company_name && (
            <div className="row">
              <div className="col-12 px-4">
                <div>
                  <strong>{company.department}</strong>
                </div>
                {company.company_name}
                <br />
                {company.address}
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-12 letter-body px-4">
              <br />
              <div dangerouslySetInnerHTML={{ __html: body }} />

              {/* {body} */}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CoverLetter;
