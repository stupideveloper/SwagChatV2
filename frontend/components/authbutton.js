import React, { useState } from 'react';
import { useRouter } from 'next/router'
import styles from '../styles/Button.module.css'

export default function AuthButton() {
  const [inputVisible, setInputVisible] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  function handleChange(event) {
    const input = event.target
    const value = input.value
  
    setUserName(value)
  }
  async function sha512(str) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str + "hahahahaha")).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
  }
  function handleLogIn() {
    sha512(userName).then((response)=>{
      localStorage.setItem('hashedUserString', response)
    })
    localStorage.setItem('user', userName);
    
    router.push('chat')
  }

    return <>
      {!inputVisible && 
        <button className={styles.button} onClick={() => {
          setInputVisible(true)
        }}>Join</button>
      }

      {inputVisible &&
        <div>
          <span>Enter Name </span>
          <input placeholder="BC Crew" onChange={handleChange}/>
          <button onClick={handleLogIn}>GO!</button>
        </div>
      }
    </>
}