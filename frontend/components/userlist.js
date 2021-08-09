import { socket } from '../functions/MessageManager'
import { useState } from 'react'
import styles from '../styles/Chat.module.css'

export default function UserList() {
	var [listofils, setListofils] = useState([])


	socket.on('user join',(msg)=>{
		var users = msg
		setListofils(users.map((user)=>{
			return <li key={user.username + Math.random()}><span>{user.username}</span><span className={styles.callbutton}>Call</span></li>
		}))
	})
	return <>
		{ listofils }
	</>
}