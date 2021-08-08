import { socket } from './MessageManager'
export async function authoriseUsername(username,locSocket) {
	console.log('Username Recived: ' + username)
	if (!username) return
	if(socket.connected) {
		//  var n = promise
		//  return n
	}
	socket.on('connect', () => {
		//  return promise
	})
	return new Promise((resolve) => {
		//socket.emit("security_req", {name: username})
		fetch('/securityreq', {
			method: 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: username,
				id: locSocket.id
			})
		}).then((resp)=>{console.log(locSocket.id + '\n' + socket.id);resolve(resp.json())})
		//socket.on('sk_set', (data)=> {
		//  console.log(data.key)
		//  console.info("Username has now been authorised, messaging enabled.")
		//  console.log("spat out: " + data.key);
		//  resolve(data.key)
		//})
	})
}

var secretkey = ''
export function getSecretKey() {
	return secretkey
}
export function setSecretKey(set) {
	secretkey = set
	return
}