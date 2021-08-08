import { socket } from '../functions/MessageManager'
import { useEffect, useState, useRef } from 'react'
import styles from '../styles/Message.module.css'


export default function ChatArea() {
	const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("chat message", (data) => {
      //decypt the message
      let temp = messages;
      temp.push({
        username: data.from,
        text: data.message,
      });
      setMessages([...temp]);
    });
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const messagesEndRef = useRef(null);

  useEffect(scrollToBottom, [messages]);


  var key = 1
	return <>
			<div>
        {messages.map((i) => {
          key++
            return (
              <div key={key} className={styles.message}>
                <span className={styles.username}>{i.username}: </span>
                <p><span className={styles.messagecontent}>{i.text}</span></p>
              </div>
            );
 
        })}
      </div>	
      <div ref={messagesEndRef} />
	</>
}
