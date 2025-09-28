import React, { useState, useEffect } from 'react';
import { Progress, Typography, Alert } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { TimerUtils } from '../../utils/timerUtils';

const { Text } = Typography;

const Timer = ({ endTimestamp, totalTime, onTimeout, paused = false }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (paused || !endTimestamp) return;

    const interval = setInterval(() => {
      const remaining = TimerUtils.getRemainingTime(endTimestamp);
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        onTimeout?.();
      }
    }, 1000);

    // Set initial value
    setRemainingTime(TimerUtils.getRemainingTime(endTimestamp));

    return () => clearInterval(interval);
  }, [endTimestamp, paused, onTimeout]);

  const progress = TimerUtils.calculateProgress(remainingTime, totalTime);
  const color = TimerUtils.getTimerColor(remainingTime, totalTime);
  const showWarning = TimerUtils.shouldShowWarning(remainingTime, totalTime);
  const formattedTime = TimerUtils.formatTime(remainingTime);

  if (paused) {
    return (
      <Alert
        message="Interview Paused"
        description="Timer is paused. Resume to continue."
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
      />
    );
  }

  return (
    <div className="text-center mb-5">
      <Progress
        type="circle"
        percent={progress}
        format={() => (
          <div>
            <ClockCircleOutlined style={{ fontSize: '24px', color }} />
            <div style={{ fontSize: '18px', fontWeight: 'bold', color }}>
              {formattedTime}
            </div>
          </div>
        )}
        strokeColor={color}
        size={120}
      />
      
      {showWarning && (
        <Alert
          message="Time Running Out!"
          description="Your answer will be auto-submitted when time expires."
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </div>
  );
};

export default Timer;