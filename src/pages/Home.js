import "./Home.css";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import resumeIcon from "../images/resumeIcon.png";
import jobIcon from "../images/jobIcon.png";
import applicantRankingIcon from "../images/applicant_ranking.png";
import recommendationIcon from "../images/recommendationIcon.png";
import homeimg from "../images/home2.png";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

// Image error handler component
const SafeImage = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <div className={`image-placeholder ${className}`} {...props}>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`image-loading ${className}`} {...props}>
          <span>Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: loading ? 'none' : 'block' }}
        {...props}
      />
    </>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <section id="hero" className="py-5">
        <div className="row mt-5">
          <div className="col-md-7">
            <h1 className="display-4 fw-bold mb-4">Welcome to Talentverse</h1>
            <h5 className="mb-4">Accelerate Your Tech Career with a World of Opportunities</h5>
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          </div>
          <div className="col-md-5">
            <SafeImage
              src={homeimg}
              alt="Talentverse Hero"
              className="img-fluid theme-shadow"
              style={{ maxHeight: '400px', width: 'auto' }}
            />
          </div>
        </div>
      </section>

      <section id="services" className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Our Services</h2>
          <div className="row g-4">
            <div className="col-lg-3 col-sm-6">
              <Link to="/resume-screening" className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="iconbox">
                      <img src={resumeIcon} alt="Resume Screening" />
                    </div>
                    <h4 className="card-title">Resume Screening</h4>
                    <p className="card-text">AI-powered resume analysis and job matching</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-sm-6">
              <Link to="/jobs" className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="iconbox">
                      <img src={jobIcon} alt="Job Search" />
                    </div>
                    <h4 className="card-title">Job Search</h4>
                    <p className="card-text">Find the perfect job that matches your skills</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-sm-6">
              <Link to="/market-analysis" className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="iconbox">
                      <img src={applicantRankingIcon} alt="Market Analysis" />
                    </div>
                    <h4 className="card-title">Market Analysis</h4>
                    <p className="card-text">Stay informed about industry trends</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-lg-3 col-sm-6">
              <Link to="/cover-letter" className="text-decoration-none text-dark">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <div className="iconbox">
                      <img src={recommendationIcon} alt="Cover Letter" />
                    </div>
                    <h4 className="card-title">Cover Letter</h4>
                    <p className="card-text">Create professional cover letters</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
