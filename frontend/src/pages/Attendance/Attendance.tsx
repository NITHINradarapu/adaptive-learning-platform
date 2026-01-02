import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './Attendance.css';
import { FaFire, FaCalendarCheck, FaChartLine, FaClock, FaVideo, FaCheckCircle } from 'react-icons/fa';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkpointsCompleted: number;
  videosWatched: number;
  totalTimeSpent: number;
  isMarked: boolean;
}

interface AttendanceSummary {
  totalDays: number;
  markedDays: number;
  attendanceRate: number;
  totalCheckpoints: number;
  totalVideos: number;
  totalTimeSpent: number;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

const Attendance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendanceData();
    fetchStreakData();
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async () => {
    try {
      const response = await apiService.getAttendanceStatus();
      if (response.data.success) {
        setSummary(response.data.data.summary);
        setRecords(response.data.data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakData = async () => {
    try {
      const response = await apiService.getCurrentStreak();
      if (response.data.success) {
        setStreak(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const response = await apiService.getAttendanceCalendar(selectedYear, selectedMonth + 1);
      if (response.data.success) {
        setCalendarData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateMarked = (day: number) => {
    const dateStr = new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0];
    return calendarData.some(record => 
      record.date.startsWith(dateStr) && record.isMarked
    );
  };

  const getDateActivity = (day: number) => {
    const dateStr = new Date(selectedYear, selectedMonth, day).toISOString().split('T')[0];
    return calendarData.find(record => record.date.startsWith(dateStr));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isMarked = isDateMarked(day);
      const activity = getDateActivity(day);
      const isToday = 
        day === new Date().getDate() && 
        selectedMonth === new Date().getMonth() && 
        selectedYear === new Date().getFullYear();

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isMarked ? 'marked' : ''} ${isToday ? 'today' : ''}`}
          title={activity ? `${activity.videosWatched} videos, ${activity.checkpointsCompleted} checkpoints` : 'No activity'}
        >
          <span className="day-number">{day}</span>
          {isMarked && <FaCheckCircle className="check-icon" />}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="attendance-container">
        <div className="loading">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h1>Attendance Tracker</h1>
        <p>Track your learning consistency and build streaks</p>
      </div>

      {/* Streak Section */}
      <div className="streak-section">
        <div className="streak-card current-streak">
          <FaFire className="streak-icon" />
          <div className="streak-info">
            <h3>Current Streak</h3>
            <p className="streak-number">{streak?.currentStreak || 0} days</p>
          </div>
        </div>
        <div className="streak-card longest-streak">
          <FaChartLine className="streak-icon" />
          <div className="streak-info">
            <h3>Longest Streak</h3>
            <p className="streak-number">{streak?.longestStreak || 0} days</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaCalendarCheck className="stat-icon" />
          <div className="stat-content">
            <h4>Attendance Rate</h4>
            <p className="stat-value">{summary?.attendanceRate.toFixed(1)}%</p>
            <p className="stat-subtitle">{summary?.markedDays} of {summary?.totalDays} days</p>
          </div>
        </div>
        <div className="stat-card">
          <FaVideo className="stat-icon" />
          <div className="stat-content">
            <h4>Videos Watched</h4>
            <p className="stat-value">{summary?.totalVideos}</p>
            <p className="stat-subtitle">Total videos completed</p>
          </div>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <div className="stat-content">
            <h4>Checkpoints</h4>
            <p className="stat-value">{summary?.totalCheckpoints}</p>
            <p className="stat-subtitle">Questions answered</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div className="stat-content">
            <h4>Time Spent</h4>
            <p className="stat-value">{Math.round((summary?.totalTimeSpent || 0) / 60)}h</p>
            <p className="stat-subtitle">{summary?.totalTimeSpent} minutes total</p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="month-nav" onClick={() => changeMonth(-1)}>←</button>
          <h2>{monthNames[selectedMonth]} {selectedYear}</h2>
          <button className="month-nav" onClick={() => changeMonth(1)}>→</button>
        </div>
        <div className="calendar-grid">
          <div className="calendar-day-header">Sun</div>
          <div className="calendar-day-header">Mon</div>
          <div className="calendar-day-header">Tue</div>
          <div className="calendar-day-header">Wed</div>
          <div className="calendar-day-header">Thu</div>
          <div className="calendar-day-header">Fri</div>
          <div className="calendar-day-header">Sat</div>
          {renderCalendar()}
        </div>
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color marked"></div>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unmarked"></div>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {records.slice(0, 10).map((record) => (
            <div key={record._id} className="activity-item">
              <div className="activity-date">
                <FaCalendarCheck className={record.isMarked ? 'marked-icon' : 'unmarked-icon'} />
                <span>{new Date(record.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="activity-stats">
                <span><FaVideo /> {record.videosWatched} videos</span>
                <span><FaCheckCircle /> {record.checkpointsCompleted} checkpoints</span>
                <span><FaClock /> {record.totalTimeSpent} min</span>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="no-activity">No attendance records yet. Start learning to build your streak!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
