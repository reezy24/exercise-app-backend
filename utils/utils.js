// https://stackoverflow.com/a/1353711
function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

function getAEST(d) {
  return new Date(new Date(d).getTime() + (10 * 60 * 60 * 1000))
}

function getStartOfDayFromDate(d) {
  return d.toISOString().split('T')[0] + 'T00:00:00.000Z'
}

function getEndOfDayFromDate(d) {
  return d.toISOString().split('T')[0] + 'T23:59:59.000Z'
}

module.exports = {
  isValidDate,
  getAEST,
  getStartOfDayFromDate,
  getEndOfDayFromDate,
}
