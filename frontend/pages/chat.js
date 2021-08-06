import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {socket} from "../functions/socket";


export default function Chat() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  var [secretkey, setSecretkey] = useState("")

  useEffect(()=>{
    // Send user to home page if they dont have all credentials
    /*if(!localStorage.getItem("user")||!localStorage.getItem("userHash")) {
      localStorage.removeItem("user")
      localStorage.removeItem("userHash")
      router.replace('/')
      return
    }*/
    // Sets username state to the stored one
    setUsername(localStorage.getItem("user"))
  })
  // Asks for authoriation when username is added or is changed
  useEffect(()=> {
    authoriseusername(username)
  },[username])

  const authoriseusername = (username) => {
    if (!username) return
    console.log('connecting i think')
    socket.on("connect", () => {
      console.log("id=" + socket.id)
      //if(!localStorage.getItem("userHash")) {
        socket.emit("security_req", {name: username})
      //} else {
      //  console.log("Already have userHash")
      //  console.log(localStorage.getItem("userHash"))
      //  return
      //} 
      console.log('sent')
      socket.on('sk_set', (data)=> {
        setSecretkey(data.key)
        console.log(data.key)
        localStorage.setItem("userHash", data.key)
      })
    })
  }

  const sendMessage = () => {
    console.log("sent: " + textinput)
  }
  const [textinput, setTextinput] = useState("")
  // The page itself
  return (
    <>
      <form onSubmit={(e)=>{
        e.preventDefault()
        console.log('sent: ' + textinput)
        /*
        * TODO: ABILITY TO SEND MESSAGE, MIN USERNAME CHAR LENGTH, TYPING ANIMATIONS, USER LIST
        */
      }}>
        <input placeholder='Enter Message' onChange={(e)=>{
          setTextinput(e.target.value)
        }}/>
        <button type='submit'>Send</button>
      </form>

    </>
  )
}

