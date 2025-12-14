import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Video, InteractiveQuestion, CheckpointResponse } from '../../types';
import QuizOverlay from './QuizOverlay';
import './VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [video, setVideo] = useState<Video | null>(null);
  const [questions, setQuestions] = useState<InteractiveQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<InteractiveQuestion | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (videoId) {
      loadVideo();
      loadQuestions();
      setSessionStartTime(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    // Check if we should show a question
    const currentQ = questions.find(
      q => !completedCheckpoints.has(q._id) &&
           currentTime >= q.timestamp &&
           currentTime < q.timestamp + 2
    );
    
    if (currentQ && !currentQuestion) {
      // Pause video and show question
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setCurrentQuestion(currentQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, questions, completedCheckpoints]);

  const loadVideo = async () => {
    try {
      const response = await apiService.getVideo(videoId!);
      setVideo(response.data);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await apiService.getVideoQuestions(videoId!);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleQuestionSubmit = async (result: CheckpointResponse) => {
    if (result.isCorrect) {
      // Mark checkpoint as completed
      setCompletedCheckpoints(prev => new Set([...prev, currentQuestion!._id]));
      
      // Close overlay and resume video
      setCurrentQuestion(null);
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
      
      // Update attendance
      try {
        await apiService.markAttendance({
          checkpointsCompleted: 1,
          videosWatched: 0,
          timeSpent: 0,
          courseId: video?.course
        });
      } catch (error) {
        console.error('Error marking attendance:', error);
      }
    } else if (result.attemptsRemaining === 0) {
      // No more attempts, allow to continue
      setCompletedCheckpoints(prev => new Set([...prev, currentQuestion!._id]));
      setCurrentQuestion(null);
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
    // Otherwise, quiz overlay will show retry option
  };

  const handleVideoEnd = async () => {
    const watchedDuration = Math.floor(duration);
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000 / 60); // minutes
    
    try {
      // Update progress
      await apiService.updateVideoProgress(videoId!, {
        watchedDuration,
        completed: completedCheckpoints.size >= (video?.requiredCheckpoints || 0)
      });
      
      // Mark attendance
      await apiService.markAttendance({
        checkpointsCompleted: completedCheckpoints.size,
        videosWatched: 1,
        timeSpent,
        courseId: video?.course
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!video) {
    return <div className="loading-container">Loading video...</div>;
  }

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={video.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleVideoEnd}
          className="video-element"
        />
        
        {currentQuestion && (
          <QuizOverlay
            question={currentQuestion}
            videoId={videoId!}
            onSubmit={handleQuestionSubmit}
            onClose={() => setCurrentQuestion(null)}
          />
        )}
        
        <div className="video-controls">
          <button onClick={togglePlayPause} className="play-button">
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="seek-bar"
          />
          
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="checkpoint-indicator">
            {completedCheckpoints.size} / {video.requiredCheckpoints} checkpoints
          </div>
        </div>
      </div>
      
      <div className="video-info">
        <h2>{video.title}</h2>
        <p>{video.description}</p>
        
        {questions.length > 0 && (
          <div className="checkpoints-list">
            <h3>Interactive Checkpoints</h3>
            <ul>
              {questions.map((q, index) => (
                <li key={q._id} className={completedCheckpoints.has(q._id) ? 'completed' : ''}>
                  <span className="checkpoint-number">{index + 1}</span>
                  <span className="checkpoint-time">{formatTime(q.timestamp)}</span>
                  <span className="checkpoint-type">{q.questionType}</span>
                  {completedCheckpoints.has(q._id) && <span className="check-mark">✓</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
