import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingCountdownTimer.css';

const FloatingCountdownTimer = ({ targetDate, votingStatus }) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const handleClick = () => {
    if (votingStatus === 'active') {
      navigate('/voter/voting');
    }
  };

  useEffect(() => {
    if (!targetDate) return;

    // Calculate initial time
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const calculateTimeRemaining = () => {
    if (!targetDate) return;

    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
      return;
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeRemaining({
      hours,
      minutes,
      seconds,
    });
  };

  const formatTime = (value) => {
    return String(value).padStart(2, '0');
  };

  // Show "VOTING IS CLOSED" if voting is closed
  if (votingStatus === 'closed') {
    return (
      <div className="floating-countdown-timer">
        <div className="countdown-header">VOTING IS CLOSED</div>
      </div>
    );
  }

  return (
    <div 
      className={`floating-countdown-timer ${votingStatus === 'active' ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      <div className="countdown-header">VOTE NOW</div>
      <div className="countdown-display">
        <span className="countdown-time">
          {formatTime(timeRemaining.hours)}:{formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
        </span>
      </div>
    </div>
  );
};

export default FloatingCountdownTimer;
