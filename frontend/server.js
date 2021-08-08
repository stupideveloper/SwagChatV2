const crypto = require('crypto')

const express = require('express')
const expressapp = express()
const httpServer = require('http').createServer(expressapp)
const next = require('next')
    
const dev = process.env.NODE_ENV !== 'development'
const app = next({ dev })
const handle = app.getRequestHandler()


const { Server } = require('socket.io')
const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST']
	}
})

// Security Hashes

/*let console = {
	log: function() {},
	warn: function() {},
	error: function() {}
}*/
let currentUsernames = []
let currentUsers = []
app.prepare()
	.then(() => {
		expressapp.use(express.json())
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
  
		//console.plead(jesuschrist)
		console.log("Test")
		// Routin

		expressapp.get('*', (req, res) => {
			return handle(req, res)
		})

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
    
		httpServer.listen(3000, (err) => {
			if (err) throw err
			console.log('> Ready on http://localhost:3000')
		})

			/* 
    * Auth Logic
    */
			//socket.on("security_req", (arg) => {
			//  authenticateUsername(arg,socket.id)});
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
				console.log('we now be in the function yoo')
				if (data.message.replaceAll(/\W/g,'')=='') return
				console.log('past the if statement lets go')


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
			console.log('YOOOOOO')
			socket.on('userconnect',()=>{
				io.emit('user join', currentUsers)
				console.log('Incomming connection')
			})
			socket.on('new message', (data) => {
				sendMessage(data, socket)
				console.log('new message alert')
			})


			/**
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

console.log('enviroment: ' + process.env.NODE_ENV)
