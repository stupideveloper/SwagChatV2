import { socket } from "./MessageManager"
export function authoriseUsername(username) {
  console.log('Username Recived: ' + username);
  if (!username) return
  if(socket.connected) {
    return sendReq()
  }
  socket.on("connect", () => {
    return sendReq()
  })
  function sendReq() {
    console.log("id=" + socket.id)
    socket.emit("security_req", {name: username})

    console.log('sent')
    socket.on('sk_set', (data)=> {
      console.log(data.key)
      console.info("Username has now been authorised, messaging enabled.")
      console.log("spat out: " + data.key);
      return (data.key)
    })
  }
}
