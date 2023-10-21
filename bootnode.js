const net = require('net');


const PEERLIST = [
	{"host": "localhost", "port": 3001}
];
//let blockchain = [];

(async function() {
	try {
		await peerDiscovery();
	} catch (err) {
		console.log("Cannot connect to peers: ", err.message);
	}
})();

// PEER DISCOVERY FUNCTIONS

async function peerDiscovery() {
	const randomPeer = await getRandomPeer();

	console.log(randomPeer);

	if (randomPeer) {
		const { host, port } = randomPeer;
		const client = net.connect(port, host, () => {
			client.write(JSON.stringify({
				type: 'getPeers', 
				requester: {
					host: "wallet", // Your own host
					port: 3030, // Your own port
			  	}
			}));
		});

		client.on('data', (data) => {
			const receivedData = JSON.parse(data);
			if (receivedData.type === 'sendPeers') {
			  // Update your list of known peers with the information received
			  const newPeers = receivedData.peers;
			  newPeers.forEach((peer) => {
				if (!PEERLIST.some((knownPeer) => knownPeer.host === peer.host && knownPeer.port === peer.port)) {
					if (peer.host != config.serverIP && peer.port != config.serverPort && peer.host != "wallet"){
						PEERLIST.push(peer);
					}
				}
			  });
			  console.log('Updated the list of known peers!');
	  
			  // Attempt to connect to the newly discovered peers
			  
			}
			client.end();
		  });
	  
		  client.on('error', (error) => {
			console.error('Error during peer discovery: Could not connect to seed peer');
		  });
	}
}

function removePeer(peerSocket) {
	const peerIndex = connectedPeers.indexOf(peerSocket);
	if (peerIndex !== -1) {
		connectedPeers.splice(peerIndex, 1);
	}
}

async function getRandomPeer() {
	const randomIndex = Math.floor(Math.random() * PEERLIST.length);
	return PEERLIST[randomIndex];
}

const server = net.createServer(socket => {
	console.log('Node connected:', socket.remoteAddress + ':' + socket.remotePort);

	//Listen for data
	socket.on('data', async data => {
    	const receivedData = await JSON.parse(data);

		if(receivedData.type === 'getPeers'){
			console.log("\x1b[92m PEER \x1b[0m","Requested peers");
			const responseData = { type: 'sendPeers', peers:PEERLIST };

			const requester = receivedData.requester;
			if (!PEERLIST.some((request) => request.host === requester.host && request.port === requester.port)) {
				if (requester.host != config.serverIP && requester.port != config.serverPort && requester.host != "wallet"){
					PEERLIST.push(requester);
				}
			}

			socket.write(JSON.stringify(responseData));
		}
		
	});

	socket.on('error', error => {
		console.error("\x1b[91m ERROR \x1b[0m",'Socket error:', error);
	});

	socket.on('end', () => {
		console.log("\x1b[91m DISCONNECT \x1b[0m",'Node disconnected:', socket.remoteAddress + ':' + socket.remotePort);
	});
});


const PORT = 3030;
server.listen(PORT, () => {
	console.log(" OPERATION ",`Node is running on port ${PORT}`);
});