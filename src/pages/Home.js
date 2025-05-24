import "./Home.css";
import { useEffect } from "react";
import Footer from "../components/Footer";
import resumeIcon from "../images/resumeIcon.png";
import jobIcon from "../images/jobIcon.png";
import applicantRankingIcon from "../images/applicant_ranking.png";
import recommendationIcon from "../images/recommendationIcon.png";
import homeimg from "../images/home2.png";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

const Home = () => {
  let easeing = [0.6, -0.05, 0.01, 0.99];

  const fadeInUp = {
    initial: {
      y: -60,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: easeing,
      },
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        delay: 1.2,
        ease: easeing,
      },
    },
  };

  const transition = { duration: 1.4, ease: [0.6, 0.01, -0.05, 0.9] };

  const firstName = {
    initial: {
      y: -20,
    },
    animate: {
      y: 0,
      transition: {
        delayChildren: 0.4,
        staggerChildren: 0.04,
        staggerDirection: -1,
      },
    },
  };

  const lastName = {
    initial: {
      y: -200,
    },
    animate: {
      y: 0,
      transition: {
        delayChildren: 0.4,
        staggerChildren: 0.04,
        staggerDirection: 1,
      },
    },
  };

  const letter = {
    initial: {
      y: 400,
    },
    animate: {
      y: 0,
      transition: { duration: 1, ...transition },
    },
  };

  const btnGroup = {
    initial: {
      y: -60,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 1.5,
        duration: 1,
        ease: easeing,
      },
    },
  };

  const { ref, inView } = useInView({ threshold: 0.2 });
  const animation = useAnimation();

  useEffect(() => {
    if (inView) {
      animation.start({
        y: 0,
        transition: {
          type: "spring",
          duration: 1,
          bounce: 0.3,
        },
      });
    }
    if (!inView) {
      animation.start({
        y: 200,
      });
    }
  }, [inView, animation]);

  return (
    <motion.div initial="initial" animate="animate">
      <section id="hero" className="container">
        <div className="row mt-5">
          <div className="col-md-7 main-text">
            <motion.h1 className="fw-semibold display-4">
              <motion.span
                variants={firstName}
                initial="initial"
                animate="animate"
              >
                <motion.span variants={letter}>W</motion.span>
                <motion.span variants={letter}>e</motion.span>
                <motion.span variants={letter}>l</motion.span>
                <motion.span variants={letter}>c</motion.span>
                <motion.span variants={letter}>o</motion.span>
                <motion.span variants={letter}>m</motion.span>
                <motion.span variants={letter}>e</motion.span>
                <motion.span variants={letter} className="second">
                  t
                </motion.span>
                <motion.span variants={letter}>o</motion.span>
              </motion.span>
            </motion.h1>
            <motion.h1 className="text-uppercase fw-semibold display-1 ">
              <motion.span
                variants={lastName}
                initial="initial"
                animate="animate"
              >
                <motion.span variants={letter}>T</motion.span>
                <motion.span variants={letter}>a</motion.span>
                <motion.span variants={letter}>l</motion.span>
                <motion.span variants={letter}>e</motion.span>
                <motion.span variants={letter}>n</motion.span>
                <motion.span variants={letter}>t</motion.span>
                <motion.span variants={letter}>v</motion.span>
                <motion.span variants={letter}>e</motion.span>
                <motion.span variants={letter}>r</motion.span>
                <motion.span variants={letter}>s</motion.span>
                <motion.span variants={letter}>e</motion.span>
              </motion.span>
            </motion.h1>
            <motion.h5 className="text-uppercase mt-3 mb-4" variants={fadeInUp}>
              Accelerate Your Tech Career with a World of Opportunities
            </motion.h5>
            <motion.div variants={btnGroup}>
              <a href="/jobs" className="btn btn-dark">
                Get Started
              </a>
            </motion.div>
          </div>
          <motion.div className="col-md-5">
            <motion.img
              src={homeimg}
              alt=""
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            />
          </motion.div>
        </div>
      </section>
      <section id="services" className="">
        <div className="container">
          <div className="row mt-5 mb-5">
            <div className="col-12 text-center">
              <motion.div
                className="section-title"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2 }}
              >
                <h3 className="page-title">Our Services</h3>
                <div className="line"></div>
              </motion.div>
            </div>
          </div>
          <div ref={ref}>
            <motion.div animate={animation}>
              <div className="row g-4 text-center">
                <div className="col-lg-3 col-sm-6">
                  <Link to="/resume-screening" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="service theme-shadow p-lg-5 p-4">
                      <div className="iconbox">
                        <img src={applicantRankingIcon} alt="" />
                      </div>
                      <h4 className="mt-4 mb-3">Resume Screening</h4>
                      <p>
                        AI-powered resume analysis and job mathching.
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="col-lg-3 col-sm-6">
                  <Link to="/mbti-analysis" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="service theme-shadow p-lg-5 p-4">
                      <div className="iconbox">
                        <img src={recommendationIcon} alt="" />
                      </div>
                      <h4 className="mt-4 mb-3">MBTI Analysis</h4>
                      <p>
                        Track successful hires based on personality matches.
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="col-lg-3 col-sm-6">
                  <Link to="/market-analysis" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="service theme-shadow p-lg-5 p-4">
                      <div className="iconbox">
                        <img src={jobIcon} alt="" />
                      </div>
                      <h4 className="mt-4 mb-3">Market Analysis</h4>
                      <p>
                        Real-time market trends and salary insights.
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="col-lg-3 col-sm-6">
                  <Link to="/ai-examination" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="service theme-shadow p-lg-5 p-4">
                      <div className="iconbox">
                        <img src={resumeIcon} alt="" />
                      </div>
                      <h4 className="mt-4 mb-3">AI Examination</h4>
                      <p>
                        Custom assessments based on job requirements
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </motion.div>
  );
};

export default Home;
