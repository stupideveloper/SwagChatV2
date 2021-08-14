import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { socket } from '../functions/MessageManager'
import { useState } from 'react'
import { getUsername } from '../functions/UsernameManager'
import styles from '../styles/Chat.module.css'
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
var sentCallRequests = []

export default function UserList() {
  const router = useRouter()
	var [listofils, setListofils] = useState([])
	useEffect(() => {
		socket.on('call request to user', (data) => {
			console.log(data)
			toast('📞 ' + data.from + ' is calling you!', {
				position: "top-right",
				autoClose: 120000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: false,
				onClick: (() => {
					acceptCall(data.fromsocket, data.uuid)
					router.push(`/call/${data.uuid}`)
				})
			});
		})
		socket.on('accepted call', (data) =>{
			console.log('acceptedcall' + data)
			if(!sentCallRequests.includes(data.uuid)) return
			router.push(`/call/${data.uuid}`)
		})
	}, [socket])
	function acceptCall(fsocket, uuid) {
		console.log('fsocket ' + fsocket)
		socket.emit('send accept call', { socket: fsocket, uuid: uuid })
	}
	function sendRequestToUser(uuid, username, id) {
		socket.emit('request call', { to: username, uuid: uuid, socket: id, fromsocket: socket.id, from: getUsername()})
		sentCallRequests.push(uuid)
	}
	socket.on('user join',(msg)=>{
		var users = msg
		setListofils(users.map((user)=>{
			return <li key={user.username + Math.random()} onClick={(e)=>{
				fetch('/newroom')
				.then(response => response.json())
				.then(data => {
					sendRequestToUser(data.uid, user.username, user.id)
					if(getUsername() == user.username) {
						toast.error(`📞 You can't call yourself, that would be weird..`, {
							position: "top-right",
							autoClose: 4500,
							hideProgressBar: false,
							closeOnClick: false,
							pauseOnHover: false,
							draggable: false,
							progress: undefined,
						});
					} else {
						toast.dark(`📞 Calling ${user.username}`, {
							position: "top-right",
							autoClose: 120000,
							hideProgressBar: false,
							closeOnClick: false,
							pauseOnHover: false,
							draggable: false,
							progress: undefined,
						});
					}
				});
			}}><span>{user.username}</span><span className={styles.callbutton}>Call</span></li>
		}))
	})
	return <>
		{ listofils }
		<ToastContainer />
	</>
}