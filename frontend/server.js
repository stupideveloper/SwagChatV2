const crypto = require('crypto')

const express = require('express')
const app = express()
const httpServer = require("http").createServer(app);
const next = require('next')
    
const dev = process.env.NODE_ENV !== 'production'
const nextapp = next({ dev })
const handle = nextapp.getRequestHandler()


const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security Hashes


let currentUsernames = []
let currentUsers = []
nextapp.prepare()
.then(() => {
  app.use(express.json())
  app.post('/userauth/newusercheck', (req, res) => {
    const reqInfo = req.body;
    console.log(reqInfo)
    const requestedUsername = reqInfo.name
    if (!requestedUsername) return
    if(currentUsernames.includes(requestedUsername.toLowerCase())) {
      res.send({}).status(409)
    } else {
      res.send({}).status(200)
    }  
  })
  
  // Routin

  app.get('*', (req, res) => {
    return handle(req, res)
  })
    
  httpServer.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })

  io.on("connection", (socket) => {
    socket.on("security_req", (arg) => {
      var needle = arg.name;
      console.log('needle=' + needle)
      if(currentUsers.find(el => el.username == needle)) { console.log("duplicate name detected"); return}
      

      const hash = crypto.createHash('md5')
      .update("PleaseChangeThisToSomthingRandomlyGenerated", 'utf8')
      .digest('hex')      
      console.log('new hash = ' + hash)

      currentUsers.push({
        id: socket.id,
        username: arg.name,
        hash: hash
      })

      currentUsernames.push(arg.name)

      socket.emit('sk_set', {key: hash})

      console.log(currentUsers)
    });
    socket.on('disconnect', () => {
      console.log(`${socket.id} just disconnected`)
      var needle = socket.id;
      // remove user object
      currentUsers = currentUsers.filter(item => item === currentUsers.find(el => el.id === needle))
      console.log(currentUsers)
    })
  });
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})