import React from 'react';

const EnvTest = () => {
  return (
    <div>
      <h2>Environment Variables Test</h2>
      <p>API URL: {process.env.REACT_APP_API_URL}</p>
      <p>Environment: {process.env.REACT_APP_ENV}</p>
    </div>
  );
};

export default EnvTest; 