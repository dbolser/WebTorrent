const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });

const peers = {};

wss.on('connection', ws => {
    const peerId = uuidv4();
    let publicKey;

    ws.on('message', message => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'join') {
            publicKey = parsedMessage.publicKey;
            peers[peerId] = { ws, publicKey };
            console.log(`New peer connected: ${peerId}`);

            // Send the new peer its ID and the list of existing peers
            const existingPeers = {};
            for (const id in peers) {
                if (id !== peerId) {
                    existingPeers[id] = peers[id].publicKey;
                }
            }
            ws.send(JSON.stringify({
                type: 'welcome',
                peerId: peerId,
                peers: existingPeers
            }));

            // Announce the new peer to all other peers
            for (const id in peers) {
                if (id !== peerId) {
                    peers[id].ws.send(JSON.stringify({
                        type: 'new-peer',
                        peerId: peerId,
                        publicKey: publicKey
                    }));
                }
            }
        } else {
            const targetPeer = peers[parsedMessage.targetPeerId];
            if (targetPeer && targetPeer.ws.readyState === WebSocket.OPEN) {
                // Add the sender's peerId to the message
                parsedMessage.senderPeerId = peerId;
                targetPeer.ws.send(JSON.stringify(parsedMessage));
            }
        }
    });

    ws.on('close', () => {
        console.log(`Peer disconnected: ${peerId}`);
        delete peers[peerId];
        // Announce the disconnected peer to all other peers
        for (const id in peers) {
            peers[id].ws.send(JSON.stringify({
                type: 'peer-disconnect',
                peerId: peerId
            }));
        }
    });
});

console.log('Signaling server started on port 8080');

