
let { Server } = require("./bwssw.js")


let server = new Server()
	
server.onConnect( async client => {
	const { name } = client
	
	let response = await client.runCommand( "say " + name + " joined" )
	
	if ( await client.test( "x=0,y=0,z=0,r=5" ) ) {
		client.sub( "PlayerMessage", event => {
			console.log( event )
		
			client.unsub("PlayerMessage")
		} )
	} else {
		
	}
} )

server.onDisconnect( client => {
	// code
} )

server.start(8089)

setInterval( async () => {
	let bannedPlayers = await server.client( "tag=ban" )

	bannedPlayers.forEach( client => {
		client.disconnect()
	} )
}, 1e3 )



