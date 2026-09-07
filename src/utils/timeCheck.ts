export const isWithinWorkingHours = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours + currentMinutes / 60;

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  if (start <= end) {
    return currentTime >= start && currentTime <= end;
  } else {
    // Crosses midnight
    return currentTime >= start || currentTime <= end;
  }
};
