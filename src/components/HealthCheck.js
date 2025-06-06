import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import axios from 'axios';

const HealthCheck = () => {
    const [backendStatus, setBackendStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                const response = await axios.get('http://localhost:8000/health');
                if (response.status === 200) {
                    setBackendStatus('healthy');
                    setError(null);
                } else {
                    setBackendStatus('unhealthy');
                    setError('Backend returned unexpected status');
                }
            } catch (err) {
                setBackendStatus('unhealthy');
                setError('Unable to connect to backend server');
                console.error('Backend health check failed:', err);
            }
        };

        checkBackendHealth();
        const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    if (backendStatus === 'healthy') return null;

    return (
        <Snackbar
            open={backendStatus === 'unhealthy'}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert severity="error" onClose={() => setBackendStatus('checking')}>
                {error || 'Backend server is not responding'}
            </Alert>
        </Snackbar>
    );
};

export default HealthCheck; 