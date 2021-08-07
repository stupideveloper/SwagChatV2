import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { socket } from '../functions/MessageManager';
import { secretKey, authoriseUsername } from '../functions/SecretKeyManager';
import { getUsername, setUsername } from '../functions/UsernameManager';
import btnstyle from '../styles/Button.module.css'
import pupstyle from '../styles/Popup.module.css'


export default function Chat() {
  const router = useRouter()
  const [stateUsername, setStateUsername] = useState("")
  const [stateSecretkey, setStateSecretkey] = useState("")

  // Not authenticated popup
  function Popup() {
    if (false) {
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
    async function test() {
      setStateUsername(getUsername())


      localStorage.removeItem("userHash")
      var hash = await authoriseUsername(localStorage.getItem("user"))
      setStateSecretkey(await hash)
      console.log('stateSecretkey' + await hash)
      localStorage.setItem("userHash", await hash)
    }
    test()
  },[])

  // The page itself
  return (
    <>
      <Popup />
      <form onSubmit={(e)=>{
        e.preventDefault()
        console.log('sent: ' + e.target.username.value)
        console.log(stateSecretkey)
        socket.emit('new message', {
          username: stateUsername,
          hash: stateSecretkey,
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

