import { socket } from '../functions/MessageManager'
import { useState } from 'react'

export default function UserList() {
	var [listofils, setListofils] = useState([])


	socket.on('user join',(msg)=>{
		var users = msg
		//console.log(msg)
		// the keys have to be unique
		// do you need a user leave connection thingo
		// no
		setListofils(users.map((user)=>{
			return <li key={user.username + Math.random()}>{user.username}</li>
		}))
	})
	return <>
		{ listofils }
	</>
}