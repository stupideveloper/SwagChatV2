import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import io from "socket.io-client";
const ENDPOINT = "http://localhost:2000";

export default function Chat() {
  const [response, setResponse] = useState("");
  const router = useRouter()

  useEffect(() => {
    /*if (!localStorage.getItem("hashedUserString")) { 
      sha512(localStorage.getItem("user")).then((e)=>{
      if (e==localStorage.getItem("hashedUserString")) {}
      else {
        //router.replace("/")
        localStorage.removeItem("user")
        localStorage.removeItem("hashedUserString")
        console.error("Incorrect Hash located")
      }
    })
  } else {
    router.replace("/")
  }
  }, [])*/
  async function sha512(str) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str + "hahahahaha")).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
  }

  useEffect(() => {
    const socket = io(ENDPOINT);
    console.log('connecting i think')
    socket.on('connection', (socket) => {
      socket.emit('chat message', {message: "hello guys"});
      console.log('sent')
    });
  }, []);

  return (
    <p>
      It's <time dateTime={response}>{response}</time>
    </p>
  );
}

