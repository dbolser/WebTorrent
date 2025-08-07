import SimplePeer from 'simple-peer';
import SimpleWebsocket from 'simple-websocket';
import { generateKeyPair, encrypt, decrypt } from './crypto';
import { Circuit, createOnion, peelOnion } from './onion';
import { TorrentClient } from './torrent-client';

const socket = new SimpleWebsocket('ws://localhost:8080');

let ourPeerId;
const peers = {};
const keyPair = generateKeyPair();
let torrentClient;

class OnionTransport {
    constructor(peers, ourPeerId, keyPair) {
        this.peers = peers;
        this.ourPeerId = ourPeerId;
        this.keyPair = keyPair;
    }

    connect(peerId, torrent) {
        // When WebTorrent wants to connect to a new peer,
        // we send an onion to that peer through our circuit.
        try {
            const circuit = new Circuit(this.peers);
            const onion = createOnion({
                type: 'torrent-peer',
                peerId: peerId
            }, circuit, this.peers, this.keyPair.secretKey);
            this.peers[circuit.peers[0]].peer.send(JSON.stringify(onion));
        } catch (error) {
            console.error(error.message);
        }
    }
}

function signal(targetPeerId, data) {
    socket.send(JSON.stringify({
        type: 'signal',
        targetPeerId: targetPeerId,
        data: data
    }));
}

function sendMessage(targetPeerId, message) {
    const theirPublicKey = peers[targetPeerId].theirPublicKey;
    const encryptedMessage = encrypt(message, theirPublicKey, keyPair.secretKey);
    peers[targetPeerId].peer.send(JSON.stringify(encryptedMessage));
}

function createPeer(targetPeerId, theirPublicKey, initiator) {
    console.log(`Creating peer connection to ${targetPeerId}, initiator: ${initiator}`);
    const peer = new SimplePeer({ initiator });

    peer.on('signal', data => {
        signal(targetPeerId, data);
    });

    peer.on('connect', () => {
        console.log(`Connected to peer ${targetPeerId}`);
        sendMessage(targetPeerId, { type: 'direct', message: `Hello from ${ourPeerId}` });

        if (!torrentClient) {
            const transport = new OnionTransport(peers, ourPeerId, keyPair);
            torrentClient = new TorrentClient({ onionTransport: transport });
        }
    });

    peer.on('data', data => {
        const decryptedMessage = decrypt(JSON.parse(data), keyPair.secretKey, theirPublicKey);

        if (!decryptedMessage) {
            console.error(`Failed to decrypt message from ${targetPeerId}`);
            return;
        }

        if (decryptedMessage.type === 'direct') {
            console.log(`Received direct message from ${targetPeerId}: ${decryptedMessage.message}`);
        } else if (decryptedMessage.type === 'onion') {
            const peeled = peelOnion(decryptedMessage, keyPair.secretKey, theirPublicKey);
            if (peeled.nextHop) {
                // Forward the onion
                sendMessage(peeled.nextHop, peeled.data);
            } else {
                // We are the destination
                if (peeled.data.type === 'torrent-peer') {
                    // A peer wants to connect for a torrent, let's use the real peerId
                    const torrentPeerId = peeled.data.peerId;
                    console.log(`Received torrent-peer request from ${torrentPeerId}`);
                    // Here you would use the torrentPeerId to establish a direct connection
                    // for the torrent data, while the signaling remains anonymous.
                    // For simplicity, we'll just log it.
                }
            }
        }
    });

    peer.on('close', () => {
        console.log(`Peer connection closed: ${targetPeerId}`);
        delete peers[targetPeerId];
    });

    peers[targetPeerId] = { peer, theirPublicKey };
    return peer;
}

socket.on('connect', () => {
    console.log('Connected to signaling server');
    // Join the network
    socket.send(JSON.stringify({
        type: 'join',
        publicKey: keyPair.publicKey
    }));
});

socket.on('data', data => {
    const message = JSON.parse(data);

    if (message.type === 'welcome') {
        ourPeerId = message.peerId;
        console.log(`Welcome! Our peerId is ${ourPeerId}`);
        for (const peerId in message.peers) {
            createPeer(peerId, message.peers[peerId], true);
        }
    } else if (message.type === 'new-peer') {
        console.log(`Discovered new peer: ${message.peerId}`);
        createPeer(message.peerId, message.publicKey, false);
    } else if (message.type === 'signal') {
        if (peers[message.senderPeerId]) {
            peers[message.senderPeerId].peer.signal(message.data);
        }
    } else if (message.type === 'peer-disconnect') {
        console.log(`Peer disconnected: ${message.peerId}`);
        if (peers[message.peerId]) {
            peers[message.peerId].peer.destroy();
        }
    }
});

const addTorrentForm = document.getElementById('add-torrent-form');
addTorrentForm.addEventListener('submit', event => {
    event.preventDefault();
    const magnetLink = event.target['magnet-link'].value;
    if (torrentClient) {
    torrentClient.add(magnetLink, torrent => {
        const log = document.getElementById('log');
        log.innerHTML += `<p>Added torrent: ${torrent.name}</p>`;
        torrent.on('download', bytes => {
            log.innerHTML += `<p>Downloaded: ${bytes}</p>`;
        });
        torrent.on('done', () => {
            log.innerHTML += `<p>Finished downloading!</p>`;
            torrent.files.forEach(file => {
                file.appendTo('#log');
            });
        });
    });
  } else {
      console.error('Torrent client not yet initialized');
  }
});

