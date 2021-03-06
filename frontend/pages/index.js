import Head from 'next/head'
import React, { useEffect } from 'react'
import AuthButton from '../components/authbutton'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'


export default function Home() {
	const router = useRouter()
	useEffect(() => {
		if (localStorage.getItem('user') || localStorage.getItem('userHash')) { 
			router.replace('chat') 
		} else {
			localStorage.removeItem('user')
			localStorage.removeItem('userHash')
		}
	})
	return (
		<div className={styles.container}>
			<Head>
				<title>SwagChat&#7515;&#xB3;</title>
				<meta name="description" content="The swaggest of the chats" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
  
			<main className={styles.main}> 
				<img src="/mascot.jpg" width="200"/>

				<h1 className={styles.title}>
            SwagChat 
					<sup className={styles.versionlabel}>V3</sup>
				</h1>

				<h2>The <strong><i>only</i></strong> group messaging platform that has ever existed</h2>
          
				<AuthButton/>

			</main>
  
			<footer className={styles.footer}>
				<a href="https://i.kym-cdn.com/entries/icons/original/000/030/873/Screenshot_20.jpg" target="_blank" rel="noopener noreferrer">
					<p>Powered by <strong> Swag</strong></p>
				</a>
			</footer>
		</div>
	)
}

