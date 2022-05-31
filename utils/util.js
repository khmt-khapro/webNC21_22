const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const formatDate = dd + "/" + mm + "/" + yyyy;
  return formatDate;
};

function getTime() {
  var date = new Date();

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return formateTime(year, month, day, hour, minute, second);
}

function formateTime(year, month, day, hour, minute, second) {
  return (
    makeDoubleDigit(year) +
    "-" +
    makeDoubleDigit(month) +
    "-" +
    makeDoubleDigit(day) +
    " " +
    makeDoubleDigit(hour) +
    ":" +
    makeDoubleDigit(minute) +
    ":" +
    makeDoubleDigit(second)
  );
}

function makeDoubleDigit(x) {
  return x < 10 ? "0" + x : x;
}

function betweenTwoDate(date1, date2) {
  var diffMins = (date1.getTime() - date2.getTime()) / 1000
  return diffMins;
}

function validateExpiredData(month, year) {
  var today, someday;
  var exMonth = month;
  var exYear = year;
  today = new Date();
  someday = new Date();
  someday.setFullYear(exYear, exMonth, 1);

  if (someday < today) {
    return false;
  }
  return true;
}

const until = {
  formatDateTime,
  getTime,
  betweenTwoDate,
  validateExpiredData
};

module.exports = until;
