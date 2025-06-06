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
  const [isVideoReady, setIsVideoReady] = useState(false);

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
        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Job details:', data);
        setJobDetails(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setVideoError('Error fetching job details: ' + error.message);
      }
    };
    fetchJobDetails();

    // Cleanup on component unmount
    return () => {
      console.log("Component unmounting. Stopping media stream.");
      stopMediaStream();
    };
  }, [id]);

  // Effect to handle video element and stream
  useEffect(() => {
    if (mediaStream && videoRef.current) {
      console.log("Setting up video element with media stream");

      const videoElement = videoRef.current;
      videoElement.srcObject = mediaStream;

      // Simplified video setup with immediate play attempt
      const setupVideo = async () => {
        try {
          // Try to play immediately
          await videoElement.play();
          console.log("Video playback started immediately");
          setVideoError(null);
          setIsVideoReady(true);
          setCurrentQuestion(0);
        } catch (error) {
          console.error("Error playing video:", error);
          // If immediate play fails, wait for canplay event
          videoElement.addEventListener('canplay', () => {
            videoElement.play()
              .then(() => {
                console.log("Video playback started after canplay");
                setVideoError(null);
                setIsVideoReady(true);
                setCurrentQuestion(0);
              })
              .catch(error => {
                console.error("Error playing video after canplay:", error);
                setVideoError("Error starting video: " + error.message);
                setIsVideoReady(false);
              });
          }, { once: true }); // Use once: true to automatically remove the listener
        }
      };

      setupVideo();

      // Add error handler
      const handleError = (error) => {
        console.error("Video error:", error);
        setVideoError("Error with video: " + error.message);
        setIsVideoReady(false);
      };

      videoElement.addEventListener('error', handleError);

      // Cleanup
      return () => {
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [mediaStream]);

  // Effect to handle video element mounting
  useEffect(() => {
    console.log("Video element effect triggered:", {
      isStarting,
      hasMediaStream: !!mediaStream,
      hasVideoRef: !!videoRef.current
    });

    let mounted = true;

    const initializeVideo = async () => {
      if (isStarting && !mediaStream && mounted) {
        try {
          console.log("Requesting media stream...");
          // Request lower resolution for faster initialization
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 }, // Reduced from 1280
              height: { ideal: 480 }, // Reduced from 720
              facingMode: "user"
            },
            audio: true
          });

          if (mounted) {
            console.log("Media stream obtained, setting up video element");
            setMediaStream(stream);
          }
        } catch (error) {
          console.error("Error accessing media devices:", error);
          if (mounted) {
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
              setVideoError("Camera and microphone access denied. Please allow access in your browser settings.");
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
              setVideoError("No camera or microphone found. Please ensure one is connected.");
            } else {
              setVideoError("Error accessing media devices: " + error.message);
            }
            setIsStarting(false);
          }
        }
      }
    };

    initializeVideo();

    return () => {
      mounted = false;
    };
  }, [isStarting]);

  const generateQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      console.log('Generating questions for job:', id);
      console.log('Job details:', jobDetails);

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
        const errorData = await response.json().catch(() => null);
        console.error('Failed to generate questions:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Generated questions:', data);
      // Extract just the question text from the response
      setQuestions(data.questions.map(q => q.question));
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
      setMediaStream(stream);

      // Ensure video element exists and set the stream
      if (videoRef.current) {
        console.log("startMediaStream: Setting video source and adding listeners.");
        videoRef.current.srcObject = stream;

        // Use 'canplaythrough' event to ensure enough data is buffered before playing
        videoRef.current.addEventListener('canplaythrough', handleCanPlayThrough);

        videoRef.current.onloadedmetadata = () => {
          console.log("startMediaStream: Video metadata loaded.");
          if (videoRef.current && videoRef.current.paused) {
            console.log("startMediaStream: Metadata loaded, video paused, attempting play...");
            videoRef.current.play().catch(error => {
              console.error("startMediaStream: Error playing video after metadata load:", error);
            });
          }
        };

        videoRef.current.addEventListener('playing', () => {
          console.log('Video is now playing.');
          setVideoError(null);
          setCurrentQuestion(0); // Set current question only after video is playing
        });

        // Explicitly attempt to play
        console.log("startMediaStream: Attempting play immediately after setting srcObject...");
        videoRef.current.play().catch(error => {
          console.error("startMediaStream: Error playing video immediately after setting srcObject:", error);
        });

      } else {
        console.error("startMediaStream: Video element reference is null when attempting to set source.");
        setVideoError("Video element not available to set source.");
        setIsStarting(false);
      }
    } catch (error) {
      console.error("startMediaStream: Error accessing media devices:", error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setVideoError("Camera and microphone access denied. Please allow access in your browser settings.");
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setVideoError("No camera or microphone found. Please ensure one is connected.");
      } else {
        setVideoError("Error accessing media devices: " + error.message);
      }
      setIsStarting(false);
    }
  };

  const stopMediaStream = () => {
    console.log("Stopping media stream");
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log("Track stopped:", track.kind);
      });
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
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
    try {
      // First check if we have job details
      if (!jobDetails) {
        console.error('Job details not available');
        setVideoError('Unable to start examination: Job details not available');
        return;
      }

      // Generate questions first
      await generateQuestions();

      // Set isStarting to true after questions are generated
      console.log("Setting isStarting to true");
      setIsStarting(true);
      setVideoError(null);

      // Start requesting media stream immediately with lower resolution
      if (!mediaStream) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 }, // Reduced from 1280
              height: { ideal: 480 }, // Reduced from 720
              facingMode: "user"
            },
            audio: true
          });
          setMediaStream(stream);
        } catch (error) {
          console.error("Error accessing media devices:", error);
          setVideoError("Error accessing camera and microphone: " + error.message);
          setIsStarting(false);
        }
      }

    } catch (error) {
      console.error('Error starting examination:', error);
      setVideoError(`Error starting examination: ${error.message}`);
      setIsStarting(false);
    }
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
                    <div>
                      <p>This AI examination will assess your skills and experience through a series of questions.</p>
                      <hr />
                      <p className="mb-0">Please ensure you have:</p>
                      <ul className="list-unstyled">
                        <li>✓ A quiet environment</li>
                        <li>✓ A working camera and microphone</li>
                        <li>✓ At least 30 minutes of uninterrupted time</li>
                      </ul>
                    </div>
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
                  <div>
                    <p>Thank you for completing the AI examination.</p>
                    <p>Your responses have been recorded.</p>
                    <p className="mb-4">Shortlisted candidates will be notified to move to the next step.</p>
                  </div>
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
                          controls={false}
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '480px',
                            objectFit: 'cover',
                            display: 'block',
                            backgroundColor: '#000'
                          }}
                          onLoadedMetadata={() => {
                            console.log("Video metadata loaded");
                            if (videoRef.current) {
                              videoRef.current.play().catch(error => {
                                console.error("Error playing video after metadata load:", error);
                              });
                            }
                          }}
                          onError={(e) => {
                            console.error("Video error:", e);
                            setVideoError("Error loading video: " + e.target.error?.message);
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
                            disabled={answers.some(answer => answer.questionIndex === currentQuestion)}
                          >
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
                      <div className="text-muted">
                        {isVideoReady ? 'Video is ready!' : 'Initializing video...'}
                      </div>
                      {!mediaStream && (
                        <div className="text-muted">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Waiting for camera access...
                        </div>
                      )}
                      {mediaStream && !isVideoReady && (
                        <div className="text-muted">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Camera access granted, setting up video stream...
                        </div>
                      )}
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