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

    socket.on('new message', (data) => {
      sendMessage(data, socket)
    })

    /* 
    * Auth Logic
    */
    socket.on("security_req", (arg) => {
      console.log("got security_req")
      var needle = arg.name;
      console.log('needle=' + needle)
      // If user already exists
      //if(currentUsers.find(el => el.username == needle)) {return}
      // If user does not fit regex
      if(!/[a-zA-Z0-9_-]{3,16}/.test(needle)) return
      const hash = crypto.createHash('md5')
      .update(needle + Date.now, 'utf8')
      .digest('hex')      
      console.log('new hash = ' + hash)
      if (currentUsers.includes({
        id: socket.id,
        username: arg.name,
        hash: hash})) {
          return
        }
      currentUsers.push({
        id: socket.id,
        username: arg.name,
        hash: hash
      })

      currentUsernames.push(arg.name)
      socket.emit('sk_set', {key: hash})
      console.log(currentUsers)
    });

    /**
    * Message Logic
    * 
    * @param {} data
    * The message to send
    * @param {} socket
    * The socket who set the message
    * 
    */
    async function sendMessage(data, socket) {
      console.log(data)
      var needle = socket.id
      //if (!currentUsers.find(el => el.id === needle)) return
      console.log('new message')
      const socketIdStore = await currentUsers.find(el => el.id === needle)
      if(!socketIdStore) return
      if (socketIdStore.hash == data.hash) {
        socket.emit('chat message', {
          from: data.username,
          message: data.message
        }) 
        console.log("message emmited")
      }
    }

    


    /**
     * Removes a user after they disconnect
     * @param {} needle 
     * The socket id of the user who disconnects
     * 
     */
    async function filterUser(needle) {
      const filter = await currentUsers.filter(item => item.id !== needle)
      console.log("finding the element:")
      currentUsers = filter
    }
    socket.on('disconnect', () => {
      console.log(`${socket.id} just disconnected`)
      var needle = socket.id;
      console.log(socket.id + ' filtering now..')
      // remove user object
      filterUser(needle)
    })
  });
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})