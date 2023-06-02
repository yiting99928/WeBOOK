import dayjs from 'dayjs';

function formatTime(unixTime: number, format = 'MM.DD HH:mm') {
  return dayjs.unix(unixTime).format(format);
}

function formatTimeRange(
  startTime: {
    seconds: number;
    nanoseconds: number;
  },
  endTime: {
    seconds: number;
    nanoseconds: number;
  },
  format = 'MM.DD HH:mm'
) {
  const formattedStartTime = dayjs.unix(startTime?.seconds).format(format);
  const formattedEndTime = dayjs.unix(endTime?.seconds).format(format);
  return `${formattedStartTime} — ${formattedEndTime}`;
}

export { formatTime, formatTimeRange };
