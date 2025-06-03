import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../../utils/axios_instance";
import AuthContext from "../../../context/AuthContext";
import { urls } from "../../../utils/config";

const Bookmark = ({ jobID, jobType }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(jobType === "BOOKMARK");

  const addBookmark = (jobID) => {
    if (!user) {
      navigate("/login");
      return;
    }

    axiosInstance
      .post(urls.JOB_BOOKMARK.replace(":job_id", jobID))
      .then((res) => {
        console.log(`Job ${jobID} bookmarked.`);
        setIsBookmarked(true);
      })
      .catch((error) => console.log("Bookmark error:", error));
  };

  const removeBookmark = (jobID) => {
    if (!user) {
      navigate("/login");
      return;
    }

    axiosInstance
      .delete(urls.JOB_BOOKMARK_DELETE.replace(":job_id", jobID))
      .then((response) => {
        console.log(`Job (${jobID}) bookmark removed!`);
        setIsBookmarked(false);
      })
      .catch((error) => {
        console.error("Error removing bookmark:", error);
      });
  };

  return (
    <div>
      {isBookmarked ? (
        <i
          className="bi bi-heart-fill fs-3 text-success me-2"
          onClick={() => removeBookmark(jobID)}
          style={{ cursor: "pointer" }}
        ></i>
      ) : (
        <i
          className="bi bi-heart text-success fs-3 me-2"
          onClick={() => addBookmark(jobID)}
          style={{ cursor: "pointer" }}
        ></i>
      )}
    </div>
  );
};

export default Bookmark;
