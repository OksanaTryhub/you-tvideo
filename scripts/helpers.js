export const convertTime = (timeString) => {
  const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
  const match = timeString.match(regex);

  if (!match) {
    return "Incorrect time format";
  }

  const hours = match[1] ? `${parseInt(match[1])} ч` : '';
  const minutes = match[2] ? `${parseInt(match[2])} мин` : '';
  const seconds = match[3] ? `${parseInt(match[3])} сек` : '';

  return `${hours} ${minutes} ${seconds}`.trim();
}


export const formatDate = (isoString) => {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat("uk-UK", {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  
  return formatter.format(date);
}

