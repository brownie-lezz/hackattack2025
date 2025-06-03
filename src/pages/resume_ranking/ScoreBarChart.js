import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Rectangle
} from "recharts";
import { Link } from "react-router-dom";

const ScoreBarChart = ({ resumeRankings }) => {
  return (
    <div className="container-fluid py-5">
      <div className="display-6 mb-4 text-center page-title fs-1">
        Applicants Resume Total Scores
      </div>
      <div className="mx-auto" style={{ width: "90%" }}>
        <ResponsiveContainer width="100%" minHeight={400}>
          <BarChart data={resumeRankings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_score" fill="#8884d8" name="Total Score" activeBar={<Rectangle fill="#82ca9d" />}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreBarChart;
