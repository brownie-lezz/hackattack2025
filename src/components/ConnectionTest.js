import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
    const [status, setStatus] = useState('Testing connection...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Test the health check endpoint
                const response = await axios.get('http://localhost:8000/health');
                setStatus('Backend is connected! Status: ' + response.data.status);
                setError(null);
            } catch (err) {
                setStatus('Failed to connect to backend');
                setError(err.message);
            }
        };

        testConnection();
    }, []);

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Backend Connection Test</h5>
                    <p className="card-text">
                        <strong>Status:</strong> {status}
                    </p>
                    {error && (
                        <div className="alert alert-danger">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionTest; 