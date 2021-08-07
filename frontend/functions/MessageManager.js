import io from "socket.io-client";

export const socket = io('http://localhost:3000');

socket.on('chat message', (data)=>{
  console.log(`${data.from} sent: ${data.message}`)
})
