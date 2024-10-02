import dayjs from 'dayjs';

function formatTime(unixTime, format = 'MM.DD HH:mm') {
  return dayjs.unix(unixTime).format(format);
}

function formatTimeRange(startTime, endTime, format = 'MM.DD HH:mm') {
  const formattedStartTime = dayjs.unix(startTime?.seconds).format(format);
  const formattedEndTime = dayjs.unix(endTime?.seconds).format(format);
  return `${formattedStartTime} — ${formattedEndTime}`;
}


export { formatTime, formatTimeRange };
