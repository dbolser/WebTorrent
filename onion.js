import { encrypt, decrypt } from './crypto';

const CIRCUIT_LENGTH = 3;

export class Circuit {
    constructor(peers) {
        this.peers = this.selectRandomPeers(peers, CIRCUIT_LENGTH);
    }

    selectRandomPeers(peers, count) {
        const peerIds = Object.keys(peers);
        if (peerIds.length < count) {
            throw new Error('Not enough peers to build a circuit');
        }

        const selectedPeers = [];
        while (selectedPeers.length < count) {
            const randomIndex = Math.floor(Math.random() * peerIds.length);
            const peerId = peerIds[randomIndex];
            if (!selectedPeers.includes(peerId)) {
                selectedPeers.push(peerId);
            }
        }
        return selectedPeers;
    }
}

export function createOnion(message, circuit, peers, ourSecretKey) {
    let onion = message;
    for (let i = circuit.peers.length - 1; i >= 0; i--) {
        const peerId = circuit.peers[i];
        const nextHop = i < circuit.peers.length - 1 ? circuit.peers[i + 1] : null;
        const theirPublicKey = peers[peerId].theirPublicKey;

        const payload = {
            nextHop: nextHop,
            data: onion
        };

        onion = encrypt(payload, theirPublicKey, ourSecretKey);
    }
    return onion;
}

export function peelOnion(onion, ourSecretKey, theirPublicKey) {
    const decrypted = decrypt(onion, ourSecretKey, theirPublicKey);
    if (!decrypted) {
        throw new Error('Failed to decrypt onion');
    }
    return decrypted;
}

