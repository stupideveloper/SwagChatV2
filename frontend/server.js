const express = require('express')
const next = require('next')
    
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()


const { Server } = require("socket.io");
const io = new Server(2000);


const currentUsernames = ["swagchat", "admin"]
app.prepare()
.then(() => {
  const server = express()
  server.use(express.json())
  server.post('/userauth/newusercheck', (req, res) => {
    const reqInfo = req.body;
    console.log(reqInfo)
    const requestedUsername = reqInfo.name
    if (!requestedUsername) return
    if(currentUsernames.includes(requestedUsername.toLowerCase())) {
      res.sendStatus(409)
    } else {
      res.sendStatus(200)
    }  
  })
  
  // Routin

  server.get('*', (req, res) => {
    return handle(req, res)
  })
    
  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})