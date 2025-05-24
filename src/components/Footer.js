import React from "react";
import "./Footer.css";
import logo from "./logo.png";

const Footer = () => {
  return (
    <footer>
      <div className="row">
        <div className="col">
          <div className="col1">
            <img src={logo} alt="Not Found" />
            <p className="brief">
              Our job portal facilitates seamless job postings, automated
              resume parsing and applicant ranking for employers, while
              providing job seekers with a user-friendly interface to apply for
              their desired positions. With our streamlined process, job
              matching has never been easier.
            </p>
          </div>
        </div>
        <div className="col">
          <div className="col3">
            <h3>Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/jobs">Jobs Lists</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col">
          <div className="col4">
            <h3>Newsletter</h3>
            <form>
              <i className="far fa-envelope"></i>
              <input type="text" placeholder="Send us some feedback" required />
              <button type="submit">
                <i className="fas fa-arrow-right"></i>
              </button>
            </form>
            <div className="social-icons">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-linkedin"></i>
              <i className="fab fa-github"></i>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <p className="copyright">TalentVerse 2025 - All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
