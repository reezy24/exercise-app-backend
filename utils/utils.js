// https://stackoverflow.com/a/1353711
function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

module.exports = {
  isValidDate
}