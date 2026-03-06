import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { SpacedRepetitionItem, ReviewSummary } from '../../types';
import './SpacedReview.css';

const SpacedReview: React.FC = () => {
  const [dueReviews, setDueReviews] = useState<SpacedRepetitionItem[]>([]);
  const [allSchedules, setAllSchedules] = useState<SpacedRepetitionItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<{ moduleId: string; moduleName: string } | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dueRes, schedulesRes, summaryRes] = await Promise.all([
        apiService.getDueReviews(),
        apiService.getAllReviewSchedules(),
        apiService.getReviewSummary(),
      ]);
      setDueReviews(dueRes.data || []);
      setAllSchedules(schedulesRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (error) {
      console.error('Failed to fetch review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReview = async (moduleId: string, moduleName: string) => {
    try {
      const res = await apiService.getReviewQuestions(moduleId, 5);
      setQuizQuestions(res.data || []);
      setActiveQuiz({ moduleId, moduleName });
      setAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
      setQuizStartTime(Date.now());
    } catch (error) {
      console.error('Failed to fetch review questions:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;

    // Calculate score (simplified — in real app, server would validate)
    const totalQuestions = quizQuestions.length || 1;
    const answeredCount = Object.keys(answers).length;
    const score = Math.round((answeredCount / totalQuestions) * 100);
    const responseTime = Math.round((Date.now() - quizStartTime) / 1000);

    try {
      await apiService.submitReview(activeQuiz.moduleId, { score, responseTime });
      setQuizScore(score);
      setQuizSubmitted(true);
      // Refresh data after submission
      fetchData();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizQuestions([]);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const getTimeUntilReview = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Due now';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="spaced-review">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading review schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spaced-review">
      <h1>🧠 Spaced Repetition Review</h1>
      <p className="subtitle">
        Strengthen your memory with scientifically-timed reviews using the SM-2 algorithm
      </p>

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="review-summary">
            <div className="review-stat">
              <div className="value urgent">{summary.dueNow}</div>
              <div className="label">Due Now</div>
            </div>
            <div className="review-stat">
              <div className="value upcoming">{summary.dueTomorrow}</div>
              <div className="label">Due Tomorrow</div>
            </div>
            <div className="review-stat">
              <div className="value primary">{summary.dueThisWeek}</div>
              <div className="label">Due This Week</div>
            </div>
            <div className="review-stat">
              <div className="value mastered">{summary.mastered}</div>
              <div className="label">Mastered</div>
            </div>
          </div>

          {/* Mastery Progress */}
          <div className="review-queue">
            <h2>Overall Mastery</h2>
            <div className="mastery-bar">
              <div className="fill" style={{ width: `${summary.masteryPercentage}%` }}>
                {summary.masteryPercentage > 0 ? `${summary.masteryPercentage}%` : ''}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
              {summary.mastered} of {summary.total} topics mastered
            </p>
          </div>
        </>
      )}

      {/* Due Reviews */}
      <div className="review-queue">
        <h2>📋 Reviews Due Now ({dueReviews.length})</h2>
        {dueReviews.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✅</div>
            <p>All caught up! No reviews due right now.</p>
            <p style={{ fontSize: '0.85rem' }}>Check back later for scheduled reviews.</p>
          </div>
        ) : (
          dueReviews.map((item) => (
            <div key={item._id} className="review-item">
              <div className="item-info">
                <div className="item-title">{item.module?.title || 'Unknown Module'}</div>
                <div className="item-meta">
                  <span>{item.course?.title || 'Unknown Course'}</span>
                  <span>Reviews: {item.totalReviews}</span>
                  <span>Last Score: {item.lastScore}/5</span>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
              </div>
              <button
                className="review-btn"
                onClick={() => startReview(item.module?._id, item.module?.title || 'Review')}
              >
                Start Review
              </button>
            </div>
          ))
        )}
      </div>

      {/* All Schedules */}
      <div className="review-queue">
        <h2>📅 All Review Schedules ({allSchedules.length})</h2>
        {allSchedules.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📚</div>
            <p>No review schedules yet.</p>
            <p style={{ fontSize: '0.85rem' }}>Complete topics in your courses to start spaced repetition.</p>
          </div>
        ) : (
          allSchedules.map((item) => (
            <div key={item._id} className="review-item">
              <div className="item-info">
                <div className="item-title">{item.module?.title || 'Unknown Module'}</div>
                <div className="item-meta">
                  <span>{item.course?.title}</span>
                  <span>{getTimeUntilReview(item.nextReviewDate)}</span>
                  <span>Interval: {item.interval} day{item.interval > 1 ? 's' : ''}</span>
                  <span>EF: {item.easinessFactor.toFixed(2)}</span>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="review-quiz-overlay" onClick={(e) => e.target === e.currentTarget && closeQuiz()}>
          <div className="review-quiz-modal">
            {!quizSubmitted ? (
              <>
                <h3>📝 Review: {activeQuiz.moduleName}</h3>
                {quizQuestions.length === 0 ? (
                  <div className="empty-state">
                    <p>No questions available for this module.</p>
                    <button className="review-btn" onClick={closeQuiz}>Close</button>
                  </div>
                ) : (
                  <>
                    {quizQuestions.map((q, idx) => (
                      <div key={q._id} className="quiz-question">
                        <div className="q-text">
                          {idx + 1}. {q.question}
                        </div>
                        {q.options && q.options.length > 0 ? (
                          <div className="q-options">
                            {q.options.map((opt: any, oi: number) => (
                              <div
                                key={oi}
                                className={`q-option ${answers[q._id] === opt.text ? 'selected' : ''}`}
                                onClick={() => handleAnswer(q._id, opt.text)}
                              >
                                {opt.text}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            value={answers[q._id] || ''}
                            onChange={(e) => handleAnswer(q._id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="review-btn" style={{ background: '#666' }} onClick={closeQuiz}>
                        Cancel
                      </button>
                      <button className="review-btn" onClick={submitQuiz}>
                        Submit Review
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {quizScore !== null && quizScore >= 80 ? '🎉' : quizScore !== null && quizScore >= 50 ? '👍' : '📖'}
                </div>
                <h3>Review Complete!</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4361ee', margin: '1rem 0' }}>
                  Score: {quizScore}%
                </p>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  {quizScore !== null && quizScore >= 80
                    ? 'Excellent recall! Your next review interval has been extended.'
                    : quizScore !== null && quizScore >= 50
                    ? 'Good effort! Keep practicing to strengthen your memory.'
                    : 'This topic needs more review. It will be scheduled sooner.'}
                </p>
                <button className="review-btn" onClick={closeQuiz}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacedReview;
