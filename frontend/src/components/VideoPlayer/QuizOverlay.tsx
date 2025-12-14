import React, { useState, useEffect } from 'react';
import { InteractiveQuestion, QuestionType, CheckpointResponse } from '../../types';
import { apiService } from '../../services/api';
import './QuizOverlay.css';

interface QuizOverlayProps {
  question: InteractiveQuestion;
  videoId: string;
  onSubmit: (result: CheckpointResponse) => void;
  onClose: () => void;
}

const QuizOverlay: React.FC<QuizOverlayProps> = ({ question, videoId, onSubmit, onClose }) => {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckpointResponse | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [attemptStartTime] = useState(Date.now());

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeout = () => {
    alert('Time is up! Please try again.');
    onClose();
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - attemptStartTime) / 1000);

    try {
      const response = await apiService.submitCheckpoint(
        videoId,
        question._id,
        {
          userAnswer: answer,
          timeSpent,
          hintUsed: showHint
        }
      );

      setResult(response.data);
      
      // If correct, auto-close after 2 seconds
      if (response.data.isCorrect) {
        setTimeout(() => {
          onSubmit(response.data);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setResult(null);
    setShowHint(false);
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <div className="quiz-header">
          <h3>Interactive Checkpoint</h3>
          <div className="timer">
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="quiz-content">
          <p className="question-text">{question.question}</p>

          {!result && (
            <>
              {question.questionType === QuestionType.MCQ && question.options ? (
                <div className="options-container">
                  {question.options.map((option, index) => (
                    <label key={index} className="option-label">
                      <input
                        type="radio"
                        name="answer"
                        value={option.text}
                        checked={answer === option.text}
                        onChange={(e) => setAnswer(e.target.value)}
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="answer-input"
                  placeholder={
                    question.questionType === QuestionType.FILL_IN_BLANK
                      ? 'Fill in the blank...'
                      : 'Type your answer...'
                  }
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                />
              )}

              {showHint && question.hint && (
                <div className="hint-box">
                  💡 Hint: {question.hint}
                </div>
              )}

              <div className="quiz-actions">
                <button
                  onClick={() => setShowHint(true)}
                  className="btn-secondary"
                  disabled={showHint}
                >
                  {showHint ? 'Hint Shown' : 'Show Hint'}
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </>
          )}

          {result && (
            <div className={`result-box ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <h4>{result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
              
              {result.isCorrect && (
                <>
                  <p>Great job! You earned {result.pointsEarned} points.</p>
                  {result.explanation && <p className="explanation">{result.explanation}</p>}
                  <p className="success-message">Resuming video...</p>
                </>
              )}

              {!result.isCorrect && (
                <>
                  {result.attemptsRemaining > 0 ? (
                    <>
                      <p>You have {result.attemptsRemaining} attempts remaining.</p>
                      {result.hint && !showHint && (
                        <p className="hint-suggestion">Try using the hint!</p>
                      )}
                      <button onClick={handleRetry} className="btn-primary">
                        Try Again
                      </button>
                    </>
                  ) : (
                    <>
                      <p>No more attempts remaining.</p>
                      {result.explanation && (
                        <p className="explanation">{result.explanation}</p>
                      )}
                      <button onClick={() => onSubmit(result)} className="btn-primary">
                        Continue Video
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="quiz-footer">
          <small>
            Points: {question.points} | Max Retries: {question.maxRetries}
          </small>
        </div>
      </div>
    </div>
  );
};

export default QuizOverlay;
