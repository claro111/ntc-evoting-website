import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, votingStatus }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeRemaining({
      days,
      hours,
      minutes,
      seconds,
    });
  };

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-blue-600 text-white rounded-lg p-4 min-w-[80px] text-center">
        <span className="text-3xl font-bold">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-gray-600 text-sm mt-2 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex justify-center items-center gap-4">
      <TimeUnit value={timeRemaining.days} label="Days" />
      <span className="text-2xl text-gray-400 font-bold">:</span>
      <TimeUnit value={timeRemaining.hours} label="Hours" />
      <span className="text-2xl text-gray-400 font-bold">:</span>
      <TimeUnit value={timeRemaining.minutes} label="Minutes" />
      <span className="text-2xl text-gray-400 font-bold">:</span>
      <TimeUnit value={timeRemaining.seconds} label="Seconds" />
    </div>
  );
};

export default CountdownTimer;
