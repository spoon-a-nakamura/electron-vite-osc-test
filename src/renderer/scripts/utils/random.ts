const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function randomString(length = 10) {
  return [...Array(length)].map(() => S[Math.floor(Math.random() * S.length)]).join('')
}
