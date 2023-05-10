import dayjs from 'dayjs';

function formatTime(unixTime, format = 'MM.DD HH:mm') {
  return dayjs.unix(unixTime).format(format);
}

function formatTimeRange(startTime, endTime, format = 'MM.DD HH:mm') {
  const formattedStartTime = formatTime(startTime?.seconds, format);
  const formattedEndTime = formatTime(endTime?.seconds, format);
  return `${formattedStartTime} — ${formattedEndTime}`;
}

export { formatTime, formatTimeRange };
