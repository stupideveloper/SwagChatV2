import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          The swaggest of the chats
        </h1>
        <h2>Please ive lost my wife and kids</h2>
      </main>

      <footer className={styles.footer}>
        <p>
        <a
          href="https://i.kym-cdn.com/entries/icons/original/000/030/873/Screenshot_20.jpg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <strong>
            Swag
          </strong>
        </a>
        </p>

      </footer>
    </div>
  )
}
