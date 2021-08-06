import react, { useState } from 'react';
import { useRouter } from 'next/router'
import styles from '../styles/Button.module.css'
import abcss from '../styles/Authbutton.module.css'

export default function AuthButton() {
  const [inputVisible, setInputVisible] = useState(false)
  const [warning, setWarning] = useState("")
  const router = useRouter()

  async function sha512(str) {
    return crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str + "hahahahaha")).then(buf => {
      return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
    });
  }
  function handleLogIn(userName) {
    fetch('/userauth/newusercheck', {
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
        <form onSubmit={(e)=> {
          e.preventDefault()
          var username = ''
          var username = e.target.username.value
          
          console.log(username)
          handleLogIn(username)
          //^[A-Za-z]\\w{5, 29}$/
          //^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$

    
        }}>
          <p style={{margin:'0 0 0.2rem 0'}}>Enter Username: </p>
          <input name="username" className={abcss.input} placeholder="MrSussyBalls" pattern={'[a-zA-Z0-9_-]{3,16}'} onSelect={()=>{router.prefetch('chat')}} style={{borderTopRightRadius:0,borderBottomRightRadius:0}}/>
          <button className={styles.primarybutton} style={{margin:0, borderTopLeftRadius:0, borderBottomLeftRadius:0}}>Go!</button>
          <ul style={{listStyleType:'none', padding:0, fontSize:'smaller', marginTop:'0.6rem'}}>
            <li>Longer than 3 letters</li>
            <li>Shorter than 16 letters</li>
            <li>No special characters</li>
          </ul>
          <p style={{color:"red", margin:0}}>{warning}</p>
        </form>
      }
    </>
}