import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { socket } from '../functions/MessageManager'
import { authoriseUsername, getSecretKey, setSecretKey } from '../functions/SecretKeyManager'
import { getUsername, setUsername } from '../functions/UsernameManager'
import btnstyle from '../styles/Button.module.css'
import UserList from '../components/userlist'
import ChatArea from '../components/chatarea'
import pupstyle from '../styles/Popup.module.css'
import styles from '../styles/Chat.module.css'
import Tooltip from '../components/tooltip'


export default function Chat() {
	const router = useRouter()
	const [timeoutfinished, setTimeoutFinished] = useState(false)
	const [timeoutdelay, setTimeoutDelay] = useState(true)
	const [connected, setConnected] = useState(false)
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
			setTimeoutFinished(true)
			localStorage.removeItem('userHash')
			authoriseUsername(getUsername(), socket).then((hash)=>{
				if(!hash)return
				setSecretKey(hash.id)
				socket.emit('userconnect','')
				localStorage.setItem('userHash', hash.id)
			})
		}
		socket.on("connect",()=>{
			test()
			setConnected(true)
			socket.on("disconnect", ()=>{
				setConnected(false)
			})
		})
		setUsername(localStorage.getItem('user'))
	},[])


	
	// The page itself
	return (
		<>
			<Head>
				<title>SwagChat&#7515;&#xB3;</title>
				<meta name="description" content="The swaggest of the chats" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Popup /> 
			<div className={styles.outerwrapper}>
				<div className={styles.chatarea}>
					<div className={styles.swagchatlogo}>
						<h3>SwagChat<sup>V3</sup></h3>
						{connected &&
							<p><span className={styles.connectionlabel}>Connected</span></p>
						} 
						{!connected &&
							<p><span className={styles.disconnectedlabel}>Disconnected</span></p>
						}
						<Tooltip question="Why can't I change my username?" answer="We disallow you changing your name for security, allowing to change a username could lead to identity theft and abuse."/>
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

