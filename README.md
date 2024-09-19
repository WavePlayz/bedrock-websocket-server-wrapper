# bedrock-websocket-server-wrapper

## Overview

This documentation covers the `PayloadMap`, `Client`, and `Server` classes designed to simplify WebSocket communication. These classes help manage WebSocket payloads, interact with WebSocket servers, and handle client-server interactions with ease.

---

## `PayloadMap` Class

**Purpose**: Manages payload generation functions to create standardized messages or commands.

### Methods

- **`set(name, payloadFunc)`**
  - **Description**: Registers a new function to generate payloads.
  - **Parameters**:
    - `name` (string): Unique name for the payload function.
    - `payloadFunc` (function): A function that returns an object. It receives the `PayloadMap` instance as its first argument.
  - **Usage**: `payloads.set('event', (self, eventName) => ({ ... }))`

- **`get(name, ...args)`**
  - **Description**: Retrieves and executes the payload function associated with the given name.
  - **Parameters**:
    - `name` (string): Name of the payload function.
    - `...args` (any): Arguments passed to the payload function.
  - **Returns**: The result of the payload function.
  - **Usage**: `let payload = payloads.get('event', 'eventName')`

- **`entries()`**
  - **Description**: Returns an iterator over all registered payload functions.
  - **Returns**: An iterator of key-value pairs (name and function).
  - **Usage**: `for (let [name, func] of payloads.entries()) { ... }`

### Example

```javascript
const payloads = new PayloadMap();

payloads.set('base', (self, purpose) => ({
  header: {
    version: 1,
    requestId: crypto.randomUUID(),
    messageType: 'commandRequest',
    messagePurpose: purpose || 'commandRequest'
  },
  body: {}
}));

let basePayload = payloads.get('base', 'somePurpose');
console.log(basePayload);
```

---

## `Client` Class

**Purpose**: Represents a WebSocket client, handling message exchanges and interactions with a WebSocket server.

### Constructor

- **`constructor(ws, onClose)`**
  - **Description**: Initializes the client with a WebSocket connection.
  - **Parameters**:
    - `ws` (WebSocket): WebSocket connection instance.
    - `onClose` (function): Callback executed when the client disconnects.

### Methods

- **`disconnect()`**
  - **Description**: Closes the WebSocket connection.
  - **Usage**: `client.disconnect()`

- **`runCommand(command)`**
  - **Description**: Sends a command to the server and returns a promise with the response.
  - **Parameters**:
    - `command` (string): Command to be executed.
  - **Returns**: A promise resolving with the server's response.
  - **Usage**: `client.runCommand('someCommand').then(response => { ... })`

- **`sub(eventName, callback)`**
  - **Description**: Subscribes to an event and sets a callback to handle responses.
  - **Parameters**:
    - `eventName` (string): Name of the event to subscribe to.
    - `callback` (function): Function to handle event responses.
  - **Usage**: `client.sub('eventName', response => { ... })`

- **`unsub(eventName)`**
  - **Description**: Unsubscribes from an event.
  - **Parameters**:
    - `eventName` (string): Name of the event to unsubscribe from.
  - **Usage**: `client.unsub('eventName')`

- **`test(value)`**
  - **Description**: Performs actions based on the type of the provided value.
  - **Parameters**:
    - `value` (string or function): Value to test. If a string, executes a command; if a function, calls the function.
  - **Returns**: Result of the command execution or function call.
  - **Usage**: `client.test('testValue')` or `client.test(function(self) { ... })`

- **`name()`**
  - **Description**: Retrieves and sets the client's name based on a test command.
  - **Returns**: A promise resolving with the client's name.
  - **Usage**: `client.name().then(name => { ... })`

### Example

```javascript
const ws = new WebSocket('ws://localhost:8080');
const client = new Client(ws, (client) => {
  console.log('Client disconnected');
});

client.sub('eventName', (response) => {
  console.log('Event received:', response);
});

client.runCommand('someCommand').then(response => {
  console.log('Command response:', response);
});
```

---

## `Server` Class

**Purpose**: Manages a WebSocket server, handling client connections and interactions.

### Constructor

- **`constructor()`**
  - **Description**: Initializes the server instance.

### Methods

- **`start(port)`**
  - **Description**: Starts the WebSocket server on the specified port.
  - **Parameters**:
    - `port` (number): Port number to listen on.
  - **Returns**: The `Server` instance.
  - **Usage**: `server.start(8080)`

- **`stop()`**
  - **Description**: Stops the WebSocket server and closes all connections.
  - **Returns**: `void`
  - **Usage**: `server.stop()`

- **`onConnect(callback)`**
  - **Description**: Registers a callback to be called when a client connects.
  - **Parameters**:
    - `callback` (function): Function to handle new client connections.
  - **Returns**: The `Server` instance.
  - **Usage**: `server.onConnect(client => { ... })`

- **`onDisconnect(callback)`**
  - **Description**: Registers a callback to be called when a client disconnects.
  - **Parameters**:
    - `callback` (function): Function to handle client disconnections.
  - **Returns**: The `Server` instance.
  - **Usage**: `server.onDisconnect(client => { ... })`

- **`client(...args)`**
  - **Description**: Retrieves clients matching the specified criteria.
  - **Parameters**:
    - `...args` (any): Criteria for filtering clients.
  - **Returns**: An array of `Client` instances that match the criteria.
  - **Usage**: `server.client('someCriteria')`

### Example

```javascript
const server = new Server();

server.onConnect(client => {
  console.log('New client connected');
});

server.onDisconnect(client => {
  console.log('Client disconnected');
});

server.start(8080);
```

---

This documentation provides an overview of how to use the classes and methods for managing WebSocket communication efficiently.


