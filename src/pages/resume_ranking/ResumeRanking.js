import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axiosInstance from "../../utils/axios_instance";
import { urls } from "../../utils/config";

import Spinner from "../../components/Spinner";
import ScoreTable from "./ScoreTable";
import ScoreBarChart from "./ScoreBarChart";
import WeightsInput from "./WeightsInput";

const ResumeRanking = () => {
  const [resumeRankings, setResumeRankings] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    axiosInstance
      .get(urls.APPLICANT_RANKING.replace(":job_id", id), {
        timeout: 30000, // 30sec as resume ranking algorithm takes a lot of time
      })
      .then((res) => {
        console.table("Resume Rankings:", res.data);
        setResumeRankings(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (resumeRankings.length === 0) {
    return (
      <div className="text-center mt-5">
        <p>Running resume parser and ranker algorithm..</p>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <WeightsInput
        resumeRankings={resumeRankings}
        setResumeRankings={setResumeRankings}
      />
      <ScoreTable resumeRankings={resumeRankings} />
      <ScoreBarChart resumeRankings={resumeRankings} />
    </>
  );
};

export default ResumeRanking;
