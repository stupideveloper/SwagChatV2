import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { socket } from '../functions/MessageManager'
import { authoriseUsername, getSecretKey, setSecretKey } from '../functions/SecretKeyManager'
import { username, getUsername, setUsername } from '../functions/UsernameManager'
import btnstyle from '../styles/Button.module.css'
import UserList from '../components/userlist'
import ChatArea from '../components/chatarea'
import pupstyle from '../styles/Popup.module.css'
import styles from '../styles/Chat.module.css'


export default function Chat() {
	const router = useRouter()
	const [timeoutfinished, setTimeoutFinished] = useState(false)
	const [timeoutdelay, setTimeoutDelay] = useState(true)

	/*
	*	 Not authenticated popup
	*/
	function Popup() {
		if (!getUsername()) {
			return (
				<div className={pupstyle.popup}>
					<div className={pupstyle.messagecontainer}>
						<h2>Woah Nelle!</h2>
						<h3>It seems as if your not signed in.</h3>
						<p>Return to the home page to re-authenticate</p>
						<button className={btnstyle.button} onClick={()=>{
							localStorage.removeItem('user')
							localStorage.removeItem('userHash')
							router.replace('/')
						}}>Home</button>
					</div>
				</div>
			)
		} else {
			return <></>
		}
	}
	// Asks for authoriation when username is added or is changed
	useEffect(()=> {
		async function test() {
			setUsername(getUsername())
			setTimeoutFinished(true)
			console.log("TEST()")
			console.log(getUsername())

			localStorage.removeItem('userHash')
			authoriseUsername(getUsername(), socket).then((hash)=>{
				if(!hash)return
				console.log(socket.id)
				console.log(hash)
				setSecretKey(hash.id)
				socket.emit('userconnect','')
				console.log('stateSecretkey ' + hash.id)
				localStorage.setItem('userHash', hash.id)
			})
		}
		setTimeout(()=>{test()},7000)
		setUsername(localStorage.getItem('user'))
		
		test()
	},[])
	// The page itself
	return (
		<>
			<Popup /> 
			<div className={styles.outerwrapper}>
				<div className={styles.chatarea}>
					<div className={styles.swagchatlogo}>
						<h3>SwagChat&trade;</h3>
						
					</div>
					<div className={styles.messages}>
						<ChatArea />
					</div>
					<div className={styles.inputmessagebox}>
						<form autoComplete="off" onSubmit={(e)=>{
							e.preventDefault()
							//console.log('sent: ' + e.target.username.value)
							console.log(getSecretKey())
							socket.emit('new message', {
								username: getUsername(),
								hash: getSecretKey(),
								message: e.target.message.value
							})
							e.target.message.value = ''
							//setTimeoutDelay(false)
							setTimeout(()=>{setTimeoutDelay(true)},1000)
						}}>
							{!timeoutfinished &&
                  <input placeholder='Loading..' name="message" disabled required/>
							}
							{timeoutfinished &&
                  <input placeholder='Enter Message' name="message" required/>
							}
							{timeoutdelay &&
                  <button type='submit' className={btnstyle.primarybutton} style={{float:'right'}}>Send</button>
							}
							{!timeoutdelay &&
                  <button type='submit' className={btnstyle.primarybuttondisabled} style={{float:'right'}} disabled>Send</button>
							}
                
						</form>
					</div>
				</div>   
				<div className={styles.userarea}>
					<div className={styles.wrapper}>
						<h4>Users</h4>
						<div className={styles.currentusers}>
							<ul className={styles.userlist}>
								<UserList />
							</ul>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

