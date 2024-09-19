
const WS = require('ws')

class PayloadMap {
	#map = new Map()
	
	set (name, payloadFunc) {
		if (
			typeof payloadFunc !== "function" || 
			typeof payloadFunc(this) !== "object"
		) return;
		
		this.#map.set( name, payloadFunc )
	}
	
	get (name, ...args) {
		let payloadFunc = this.#map.get( name )
		
		return payloadFunc?.( this, ...args )
	}
	
	entries () {
		return this.#map.entries()
	}
}

let payloads = new PayloadMap()

payloads.set( "base", (self, purpose) => ({
	header: {
		"version": 1,
		"requestId": crypto.randomUUID(),
		"messageType": "commandRequest",
		"messagePurpose": purpose || "commandRequest"
	},
	body: {}
}) )

payloads.set( "event", (self, eventName, subscribe = true) => {
	let purpose = subscribe ? "subscribe" : "unsubscribe"
	
	let payload = self.get( "base", purpose )
	
	payload.body = { eventName }
	
	return payload
})

payloads.set( "command", (self, commandLine) => {
	let payload = self.get( "base" )
	
	payload.body = {
		version: 1,
		origin: { type: "player" },
		overworld: "default",
		commandLine
	}
	
	return payload
})


class Client {
	_eventHandlers = new Map()
	
	constructor (ws, onClose) {
		this._ws = ws
		this._onClose = onClose
		this._name = null
		
		this._initEvents()
	}
	
	_initEvents () {
		this._ws.on( "message", 
			response => this._handleResponse(response) )
			
		this._ws.on( "close", () => {
			this._eventHandlers.clear()
			this._onClose?.(this) 
		})
	}
	
	_handleResponse ( response ) {
		let responsePayload = JSON.parse( response )
		let { eventName, requestId } = responsePayload.header
		
		let eventId = eventName ?? requestId
		
		let handler = this._eventHandlers.get( eventId )
		
		handler?.( responsePayload )
	}
	
	disconnect () {
		this.ws.close()
	}
	
	_send (payload, callback, onlyOnce) {
		let eventId = payload.header.requestId
		
		this._eventHandlers.set( eventId, (responsePayload) => {
			if (onlyOnce)
				this._eventHandlers.delete( eventId );
				
			callback?.( responsePayload )
		} )
		
		this._ws.send( JSON.stringify( payload ) )
	}
	
	async _runCommand (command) {
		let payload = payloads.get( "command", command )
		
		return new Promise( resolve => {
			this._send( payload, responsePayload => {
				resolve( responsePayload )
			}, true )
		})
	}
	
	runCommand () {
		return this._runCommand( ...arguments )
	}
	
	_sub (eventName, subbing, callback) {
		let payload = payloads.get( "event", eventName, subbing )
		
		this._send( this.ws, payload, subbing && callback, false )
	}
	
	sub (eventName, callback) {
		this._sub( eventName, true, callback )
	}
	
	unsub (eventName) {
		this._sub( eventName, false )
		this._eventHandlers.delete( eventName )
	}
	
	_test (value) {
		switch (typeof value) {
			case "string":
				value = value?.replace( /^\[/, "" ) || ""
				return this._runCommand( `testfor @s[ ${ selectorBody } ]` )
				break
			case "function":
				return value(this)
				break
		}
		
	}
	
	test () {
		return _test( ...arguments )
	}
	
	async name () {
		return this._name = (await this._test())?.victims?.[0] 
	}
}

class Server {
	constructor () {
		this._port = null
		this._webSocketServer = null
		this._connectHandler = null
		this._disconnectHandler = null
		
		this._clients = new Set()
	}
	
	start (port) {
		this.stop()
		
		this._webSocketServer = new WS.Server({ port })
		
		this.#initServer()
		
		return this
	}
	
	stop () {
		this._webSocketServer?.clients.forEach( v => v.close() ) 
		
		this._webSocketServer?.close()
		this._webSocketServer = null
	}
	
	#initServer () {
		this._webSocketServer.on( "connection", async ws => {
			let client = new Client(ws, self => {
				this._disconnectHandler?.( self )
				this._clients.delete( self )
			})
			
			let name = await client.name()
			
			this._clients.add( client )
			this._connectHandler?.( client )
		} )
	}
	
	onConnect ( callback ) {
		this._connectHandler = callback
		return this
	}
	
	onDisconnect ( callback ) {
		this._disconnectHandler = callback
		return this
	}
	
	client () {
		let filteredClients = []
		
		this._clients.forEach( client => {
			if ( client.test(...arguments) )
				filteredClients.push( client )
		} )
		
		return filteredClients
	}
	
}

module.exports = { PayloadMap, Server, Client, payloads }




