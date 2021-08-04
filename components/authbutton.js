import React, { useState } from 'react';

export default function AuthButton() {
  const [inputVisible, setInputVisible] = useState(false)
  const [userName, setUserName] = useState("")

  function handleChange(event) {
    const input = event.target;
    const value = input.value;
  
    setUserName(value)
  }
  function handleLogIn() {
    localStorage.setItem('user', userName);
  }

    return <>
      {!inputVisible && 
        <button onClick={() => {
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



