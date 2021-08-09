require('dotenv').config();

const crypto = require('crypto')
const {v4: uuidv4} = require("uuid")


const express = require('express')
const expressapp = express()
const httpServer = require('http').createServer(expressapp)
const next = require('next')
    
const dev = process.env.NODE_ENV !== 'development'
const app = next({ dev })
const handle = app.getRequestHandler()

const { Server } = require('socket.io')

const users = {};

const socketToRoom = {};

const PORT = 3000


const io = new Server(httpServer, {
	cors: {
		origin: `*`,
		methods: ['GET', 'POST']
	}
})



// Security Hashes

let currentUsernames = []
let currentUsers = []
app.prepare()
	.then(() => {
		expressapp.use(express.json())



		/* 
		* Check if username is free
		*/
		expressapp.post('/userauth/newusercheck', (req, res) => {
			const reqInfo = req.body
			//console.log(reqInfo)
			const requestedUsername = reqInfo.name
			if (!requestedUsername) return
			if(currentUsernames.includes(requestedUsername.toLowerCase())) {
				res.send({}).status(409)
			} else {
				res.send({}).status(200)
			}  
		})
  
		expressapp.get('/newroom', (req, res) => {
			res.redirect(`/call/${uuidv4()}`)
		})
		
		expressapp.get('*', (req, res) => {
			return handle(req, res)
		})
		/*
		* Auth Logic
		*/ 
		expressapp.post('/securityreq',(req,res) => {
			var e = req.body
			if (e.name) {
				res.json({id:authenticateUsername(e,e.id)})
				res.status(200)
				res.end()
			}
		})
		
		function authenticateUsername(arg,socketid) {
			//console.log("got security_req")
			var needle = arg.name
			//console.log('needle=' + needle)
			// If user already exists
			currentUsers = currentUsers.filter(el => el.username !== needle)
			// If user does not fit regex
			if(!/[a-zA-Z0-9_-]{3,16}/.test(needle)) return
			var date = new Date().toTimeString()
			const hash = crypto.createHash('md5')
				.update(needle + date, 'utf8')
				.digest('hex')      
			//console.log('new hash = ' + hash)
			//userstoids[]
			if (currentUsers.includes({
				id: socketid,
				username: arg.name,
				hash: hash})) {
				return
			}
			currentUsers.push({
				id: socketid,
				username: arg.name,
				hash: hash
			})
			//console.log(currentUsers)
			currentUsernames.push(arg.name)
			io.emit('user join',currentUsers)
			return hash 
		}
    
		httpServer.listen(PORT, (err) => {
			if (err) throw err
			console.log(`> Ready on http://localhost:${PORT}`)
		})

		/*
    * Message Logic
    * 
    * @param {} data
    * The message to send
    * @param {} socket
    * The socket who set the message
    * 
    */
			 async function sendMessage(data, socket) {
				if (data.message.replaceAll(/\W/g,'')=='') return


				//console.log(data)
				var needle = socket.id
				//if (!currentUsers.find(el => el.id === needle)) return
				//console.log('new message. needle: ' + needle)
				const socketIdStore = await currentUsers.find(el => el.id === needle)
				//console.log(socketIdStore)
				if(!socketIdStore) return
				//console.log('new message2')

				if (socketIdStore.hash == data.hash) {
					io.emit('chat message', {
						from: data.username,
						message: data.message
					}) 
					//console.log("message emmited")
				} else {
					console.error("i have no clue what is wrong")
				}
			}

    

		io.on('connection', (socket) => {
			/*
			* User connection logic
			*/
			socket.on('userconnect',()=>{
				io.emit('user join', currentUsers)
				console.log('Incomming connection')
			})

			/*
			* New message socket logic
			*/
			socket.on('new message', (data) => {
				sendMessage(data, socket)
				console.log('new message alert')
			})

			/*
			* Video Chat Logic
			*/
			socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

			/*
			 * Removes a user after they disconnect
			 * @param {} needle 
			 * The socket id of the user who disconnects
			 * 
			*/
			async function filterUser(needle) {
				const filter = await currentUsers.filter(item => item.id !== needle)
				//console.log("finding the element:")
				//console.log(currentUsers)
				// thats a bit pissy
				currentUsers = filter
				io.emit('user join',currentUsers)
				//console.log(currentUsers)
				//console.log("????")
			}
			socket.on('reload userlist',()=>{
				socket.emit('user join',currentUsers)
				// my problem is i have no clue what causes it
			})
			socket.on('disconnect', () => {
				console.log(`${socket.id} just disconnected`)
				var needle = socket.id
				//console.log(socket.id + ' filtering now..')
				// remove user object
				filterUser(needle)
			})
		})
	})
	.catch((ex) => {
		console.error(ex.stack)
		process.exit(1)
	})

