import React, { useState } from 'react';
import { useRouter } from 'next/router'
import styles from '../styles/Button.module.css'

export default function AuthButton() {
  const [inputVisible, setInputVisible] = useState(false)
  const [userName, setUserName] = useState("")
  const [warning, setWarning] = useState("")
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

    fetch('http://localhost:3000/userauth/newusercheck', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName
      })
    })
    .then(response => {
      response.json()
      if(response.status == 409) {
        console.warn("Username is in use")
        setWarning("That username is unavaliable.")
      }
      if(response.status == 200) {
        sha512(userName).then((response)=>{
          localStorage.setItem('hashedUserString', response)
        })
        localStorage.setItem('user', userName);
        
        router.push('chat')
      }

    })
  }

    return <>
      {!inputVisible && 
        <button className={styles.button} onClick={() => {
          setInputVisible(true)
        }}>Join</button>
      }

      {inputVisible &&
        <div>
          <p style={{margin:0}}>Enter Username: </p>
          <input placeholder="Mr Sussy Balls" onChange={handleChange} onSelect={()=>{router.prefetch('chat')}}/>
          <button onClick={handleLogIn}>GO!</button>
          <p style={{color:"red", margin:0}}>{warning}</p>
        </div>
      }
    </>
}