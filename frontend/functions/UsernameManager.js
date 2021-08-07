var username = 'test tickles'
export function getUsername() {
  return username
}
export function setUsername(set) {
  username = set
  console.info("Username is now: " + username)
  return
}