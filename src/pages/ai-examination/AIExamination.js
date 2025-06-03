import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../utils/config';

const AIExamination = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Define handleCanPlayThrough outside startMediaStream for scope access
  const handleCanPlayThrough = () => {
    if (!videoRef.current) return;
    console.log('Video can play through, attempting to play.');
     videoRef.current.play()
      .then(() => {
        console.log("Video playback started successfully from canplaythrough.");
        // Once playing, we can remove this listener
        if (videoRef.current) {
           videoRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
        }
      })
      .catch(error => {
        console.error("Error during video play() promise from canplaythrough:", error);
        setVideoError("Error starting video playback: " + error.message);
      });
  };

  // Fetch job details when component mounts
  useEffect(() => {
    console.log("Component mounted. Fetching job details.");
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_URL}api/jobs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setJobDetails(data);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };
    fetchJobDetails();

    // Cleanup on component unmount
    return () => {
      console.log("Component unmounting. Stopping media stream.");
      stopMediaStream();
    };
  }, [id]);

  // Effect to start media stream when starting and videoRef is ready
  useEffect(() => {
    console.log(`useEffect [isStarting, mediaStream, videoRef.current] - isStarting: ${isStarting}, mediaStream: ${mediaStream}, videoRef.current: ${videoRef.current ? 'Exists' : 'Null'}`);
    if (isStarting && !mediaStream && videoRef.current) {
      console.log("useEffect attempting to start media stream.");
      startMediaStream();
    } else if (!isStarting && mediaStream) {
      console.log("useEffect: isStarting is false and mediaStream exists, stopping stream.");
      stopMediaStream();
    }
  }, [isStarting, mediaStream, videoRef.current]);

  const generateQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`${API_URL}api/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: id,
          num_questions: 5,
          question_types: ['behavioral', 'technical', 'situational'],
          job_title: jobDetails?.title,
          job_description: jobDetails?.description,
          required_skills: jobDetails?.required_skills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to default questions if API fails
      setQuestions([
        "Tell me about yourself and your experience.",
        "What are your greatest strengths?",
        "Why do you want to work for this company?",
        "Where do you see yourself in five years?",
        "What is your greatest professional achievement?"
      ]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const startMediaStream = async () => {
    if (mediaStream) {
      console.log("startMediaStream: Media stream already exists, stopping existing stream before starting new one.");
      stopMediaStream(); // Ensure previous stream is stopped
    }

    try {
      console.log("startMediaStream: Requesting media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });
      
      console.log("startMediaStream: Media stream obtained.");
      console.log("startMediaStream: Video track settings:", stream.getVideoTracks()[0]?.getSettings());
      console.log("startMediaStream: Audio track settings:", stream.getAudioTracks()[0]?.getSettings());
      setMediaStream(stream);
      
      // Ensure video element exists and set the stream
      if (videoRef.current) {
        console.log("startMediaStream: Setting video source and adding listeners.");
        videoRef.current.srcObject = stream;
        
        // Use 'canplaythrough' event to ensure enough data is buffered before playing
        videoRef.current.addEventListener('canplaythrough', handleCanPlayThrough);

        videoRef.current.onloadedmetadata = () => {
          console.log("startMediaStream: Video metadata loaded.");
           // If canplaythrough doesn't fire quickly, try playing anyway after metadata loads
           // This helps in some browsers where canplaythrough might be delayed
           if (videoRef.current && videoRef.current.paused) {
                console.log("startMediaStream: Metadata loaded, video paused, attempting play...");
                 videoRef.current.play().catch(error => {
                    console.error("startMediaStream: Error playing video after metadata load:", error);
                    // setVideoError("Error starting video: " + error.message); // Avoid overwriting more specific errors
                 });
           }
        };

        videoRef.current.addEventListener('playing', () => {
          console.log('Video is now playing.');
          setVideoError(null); // Clear any previous video errors if playback starts
        });

        videoRef.current.addEventListener('error', (event) => {
          console.error('Video playback error event:', event);
          const error = event.target.error;
          let errorMessage = "Unknown video playback error.";
          if (error) {
            switch (error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'Video playback aborted.';
                break;
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'A network error caused the video download to fail.';
                break;
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'The video playback was aborted due to a corruption problem or because the video used features the browser did not support.';
                break;
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'The video could not be loaded, either because the server or network failed or because the format is not supported.';
                break;
              default:
                errorMessage = 'An unknown error occurred.';
                break;
            }
             console.error("startMediaStream: MediaError code:", error.code, "message:", error.message);
          }
          setVideoError("Video error: " + errorMessage);
        });

        videoRef.current.addEventListener('stalled', () => {
          console.log('Video playback stalled.');
        });

         videoRef.current.addEventListener('suspend', () => {
          console.log('Video playback suspended.');
        });

        videoRef.current.addEventListener('waiting', () => {
          console.log('Video is waiting for data.');
        });

        // Explicitly attempt to play immediately after setting srcObject
        // This might help trigger playback sooner in some scenarios
         console.log("startMediaStream: Attempting play immediately after setting srcObject...");
         videoRef.current.play().catch(error => {
            console.error("startMediaStream: Error playing video immediately after setting srcObject:", error);
            // setVideoError("Error starting video: " + error.message); // Avoid overwriting more specific errors
         });


      } else {
        console.error("startMediaStream: Video element reference is null when attempting to set source.");
        setVideoError("Video element not available to set source.");
      }
    } catch (error) {
      console.error("startMediaStream: Error accessing media devices:", error);
      // Check for specific Permissions API errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
         setVideoError("Camera and microphone access denied. Please allow access in your browser settings.");
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setVideoError("No camera or microphone found. Please ensure one is connected.");
      } else {
          setVideoError("Error accessing media devices: " + error.message);
      }
    }
  };

  const stopMediaStream = () => {
    console.log("stopMediaStream: Stopping media stream.");
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log("stopMediaStream: Track stopped:", track.kind);
      });
      setMediaStream(null);
      console.log("stopMediaStream: Media stream state set to null.");
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      console.log("stopMediaStream: Video srcObject set to null.");
       // Remove all event listeners to prevent memory leaks
       const videoElement = videoRef.current;
       if (videoElement) {
           videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
           // Note: Removing anonymous functions used as listeners is tricky. 
           // We should ideally use named functions or a different approach for listeners.
           // For now, rely on garbage collection or component unmount for other listeners.
       }
    }
     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log("stopMediaStream: Media recorder stopped.");
     }
     if (timerRef.current) {
         clearInterval(timerRef.current);
         console.log("stopMediaStream: Timer cleared.");
     }
     setIsRecording(false);
     setRecordingTime(0);
     console.log("stopMediaStream: Recording state reset.");
  };

  const startRecording = () => {
    console.log("startRecording called.");
    if (!mediaStream) {
       console.error("startRecording: Cannot start recording, media stream is not available.");
       return;
    }

    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      // Store the answer with question index
      setAnswers(prev => [...prev, {
        questionIndex: currentQuestion,
        question: questions[currentQuestion],
        answer: blob,
        duration: recordingTime
      }]);
      setRecordingTime(0);
    };

    mediaRecorder.start();
    setIsRecording(true);
    console.log("Media recording started.");
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
     console.log("stopRecording called.");
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
       console.log("Media recording stopped and timer cleared.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExamination = async () => {
    console.log("handleStartExamination called.");
    setIsStarting(true);
    setVideoError(null);
    await generateQuestions();
    setCurrentQuestion(0);
     // The useEffect will now handle starting the media stream
  };

  const handleNextQuestion = () => {
    console.log("handleNextQuestion called.");
    stopRecording();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log('Examination completed.');
      stopMediaStream(); // Stop stream on completion
      setIsCompleted(true); // Set completion state to true
      setCurrentQuestion(null); // Clear current question display
      console.log('All answers:', answers);
      // No longer setting setIsStarting(false) here
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    console.log("Component mounted - primary effect.");
    // ... existing fetch job details logic ...

    return () => {
      console.log("Component unmounting - primary effect cleanup.");
      stopMediaStream();
    };
  }, [id]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h2 className="card-title mb-4">AI Examination</h2>
              
              {!isStarting ? (
                <>
                  <div className="alert alert-info mb-4">
                    <h4 className="alert-heading">Ready to Begin?</h4>
                    <p>This AI examination will assess your skills and experience through a series of questions.</p>
                    <hr />
                    <p className="mb-0">Please ensure you have:</p>
                    <ul className="list-unstyled">
                      <li>✓ A quiet environment</li>
                      <li>✓ A working camera and microphone</li>
                      <li>✓ At least 30 minutes of uninterrupted time</li>
                    </ul>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleStartExamination}
                    disabled={isLoadingQuestions}
                  >
                    {isLoadingQuestions ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating Questions...
                      </>
                    ) : (
                      'Start AI Examination'
                    )}
                  </button>
                </>
              ) : isCompleted ? (
                <div className="text-center">
                  <h3 className="text-success mb-3">Examination Completed!</h3>
                  <p>Thank you for completing the AI examination.</p>
                  <p>Your responses have been recorded.</p>
                  <p className="mb-4">Shortlisted candidates will be notified to move to the next step.</p>
                  <button 
                    className="btn btn-primary btn-lg px-5"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  {videoError && (
                    <div className="alert alert-danger mb-4">
                      {videoError}
                    </div>
                  )}
                  
                  {currentQuestion !== null ? (
                    <>
                      <div className="video-container mb-4" style={{ 
                        width: '100%', 
                        maxWidth: '640px', 
                        margin: '0 auto',
                        position: 'relative',
                        backgroundColor: '#000',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '480px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        {isRecording && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(255, 0, 0, 0.7)',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            zIndex: 1
                          }}>
                            Recording... {formatTime(recordingTime)}
                          </div>
                        )}
                      </div>
                      
                      <div className="alert alert-primary mb-4">
                        <h4>Question {currentQuestion + 1} of {questions.length}</h4>
                        <p className="mb-0">{questions[currentQuestion]}</p>
                      </div>

                      <div className="d-flex justify-content-center gap-3">
                        {!isRecording ? (
                          <button 
                            className="btn btn-danger btn-lg"
                            onClick={startRecording}
                            // Disable if already recorded
                            disabled={answers.some(answer => answer.questionIndex === currentQuestion)}
                          >
                            {/* Change button text if already recorded */}
                            {answers.some(answer => answer.questionIndex === currentQuestion) ? 'Recorded' : 'Start Recording'}
                          </button>
                        ) : (
                          <button 
                            className="btn btn-warning btn-lg"
                            onClick={stopRecording}
                          >
                            Stop Recording
                          </button>
                        )}
                        
                        <button 
                          className="btn btn-primary btn-lg"
                          onClick={handleNextQuestion}
                          disabled={isRecording}
                        >
                          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Examination'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h4>Preparing your session...</h4>
                      <p className="text-muted">Please wait while we set up your environment.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExamination; 