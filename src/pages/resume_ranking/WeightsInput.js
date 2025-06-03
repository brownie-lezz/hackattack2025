import { useState } from "react";

const WeightsInput = ({ resumeRankings, setResumeRankings }) => {
  const [weights, setWeights] = useState({
    description: 0.15,
    education: 0.2,
    experience: 0.35,
    skills: 0.2,
    projects: 0.1,
  });

  const [showAlert, setShowAlert] = useState(false);

  const updateTotalScore = () => {
    const sumOfWeights = Object.values(weights)
      .map((weight) => Math.round(weight * 100))
      .reduce((sum, roundedWeight) => sum + roundedWeight, 0);

    if (sumOfWeights !== 100) {
      //   console.log(sumOfWeights);
      setShowAlert(true);
      return;
    } else {
      setShowAlert(false);
    }

    const updatedRankings = resumeRankings.map((entry) => {
      const newTotalScore =
        entry.description_score * weights.description +
        entry.education_score * weights.education +
        entry.experience_score * weights.experience +
        entry.skills_score * weights.skills +
        entry.projects_score * weights.projects;

      return {
        ...entry,
        total_score: Math.round(newTotalScore),
      };
    });

    // Sort the updatedRankings based on the total_score
    updatedRankings.sort((a, b) => b.total_score - a.total_score);

    setResumeRankings(updatedRankings);
  };

  const handleWeightChange = (category, value) => {
    setShowAlert(false);
    const floatValue = parseFloat(value);
    const clampedValue = Math.min(1, Math.max(0, floatValue)); // Clamp between 0 and 1
    setWeights({
      ...weights,
      [category]: clampedValue.toFixed(2),
    });
  };

  return (
    <div className="container py-5 px-sm-5 my-4 bg-white shadow rounded">
      {/* Input fields for dynamic weights */}
      <div className="row g-3 mb-3">
        <h3>Weights</h3>
        {/* Description Weight */}
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label">Description:</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={weights.description}
            onChange={(e) => handleWeightChange("description", e.target.value)}
            className="form-control"
          />
        </div>

        {/* Education Weight */}
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label">Education :</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={weights.education}
            onChange={(e) => handleWeightChange("education", e.target.value)}
            className="form-control"
          />
        </div>

        {/* Experience Weight */}
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label">Experience :</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={weights.experience}
            onChange={(e) => handleWeightChange("experience", e.target.value)}
            className="form-control"
          />
        </div>

        {/* Skills Weight */}
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label">Skills :</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={weights.skills}
            onChange={(e) => handleWeightChange("skills", e.target.value)}
            className="form-control"
          />
        </div>

        {/* Projects Weight */}
        <div className="col-6 col-md-4 col-lg-2">
          <label className="form-label">Projects :</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={weights.projects}
            onChange={(e) => handleWeightChange("projects", e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {showAlert && (
        <div className="alert alert-danger" role="alert">
          Sum of weights must be equal to 1. Please adjust the weights.
        </div>
      )}
      <button onClick={updateTotalScore} className="btn btn-primary">
        Update Total Scores
      </button>
    </div>
  );
};

export default WeightsInput;
