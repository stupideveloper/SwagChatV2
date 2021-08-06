import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {socket} from '../functions/socket';
import btnstyle from '../styles/Button.module.css'
import pupstyle from '../styles/Popup.module.css'


export default function Chat() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [secretkey, setSecretkey] = useState("")

  // Not authenticated popup
  function Popup() {
    if (!username) {
      return (
        <div className={pupstyle.popup}>
          <div className={pupstyle.messagecontainer}>
            <h2>Woah Nelle!</h2>
            <h3>It seems as if your not signed in.</h3>
            <p>Return to the home page to re-authenticate</p>
            <button className={btnstyle.button} onClick={()=>{
              localStorage.removeItem("user")
              localStorage.removeItem("userHash")
              router.replace('/')
            }}>Home</button>
          </div>
        </div>
      )
    } else {
      return <></>
    }
  }

  useEffect(()=>{
    // Sets username state to the stored one
    setUsername(localStorage.getItem("user"))
  },[])
  // Asks for authoriation when username is added or is changed
  useEffect(()=> {
    authoriseusername(localStorage.getItem("user"))
  },[])

  const authoriseusername = (username) => {
    if (!username) return
    if(socket.connected) {
      sendReq()
    }
    socket.on("connect", () => {
      sendReq()
    })
    function sendReq() {
      console.log("id=" + socket.id)
      //if(!localStorage.getItem("userHash")) {
      localStorage.removeItem("userHash")
      socket.emit("security_req", {name: username})
      //} else {
      //  console.log("Already have userHash, but re-requesting")
      //  console.log(localStorage.getItem("userHash"))
      //  return
      //} 
      console.log('sent')
      socket.on('sk_set', (data)=> {
        setSecretkey(data.key)
        console.log(data.key)
        localStorage.setItem("userHash", data.key)
      })
    }
  }

  /*
  * Recive Message Handeler
  */
  socket.on('chat message', (data)=>{
    console.log('msg')
  })

  // The page itself
  return (
    <>
      <Popup />
      <form onSubmit={(e)=>{
        e.preventDefault()
        console.log('sent: ' + e.target.username.value)
        console.log(secretkey)
        socket.emit('new message', {
          username: username,
          hash: secretkey,
          message: e.target.username.value
        })
        e.target.username.value = ""
        /*
        * TODO: ABILITY TO RECIVE MESSAGE, MIN USERNAME CHAR LENGTH, TYPING ANIMATIONS, USER LIST
        */
      }}>
        <input placeholder='Enter Message' name="username"/>
        <button type='submit'>Send</button>
      </form>

    </>
  )
}

