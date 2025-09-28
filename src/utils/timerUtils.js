export class TimerUtils {
  static getRemainingTime(endTimestamp) {
    if (!endTimestamp) return 0;
    return Math.max(0, Math.floor((endTimestamp - Date.now()) / 1000));
  }

  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  static getTimerColor(remainingTime, totalTime) {
    const percentage = remainingTime / totalTime;
    if (percentage > 0.5) return '#52c41a'; // Green
    if (percentage > 0.25) return '#faad14'; // Yellow
    return '#ff4d4f'; // Red
  }

  static calculateProgress(remainingTime, totalTime) {
    if (totalTime === 0) return 0;
    return ((totalTime - remainingTime) / totalTime) * 100;
  }

  static shouldShowWarning(remainingTime, totalTime) {
    return remainingTime <= Math.max(10, totalTime * 0.1); // 10 seconds or 10% of total time
  }
}