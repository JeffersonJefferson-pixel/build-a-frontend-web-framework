export function isNotEmptyString(str) {
  return str !== ''
}

export function isNoBlankOrEmptyString(str) {
  return isNotEmptyString(str.trim())
}