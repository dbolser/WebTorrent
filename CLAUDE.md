# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 100% browser-based torrent client with anonymous peer discovery through a custom Tor-like onion routing network. The system uses a hybrid approach where peer discovery is anonymized through onion routing, but actual data transfer happens directly via WebRTC for performance.

## Development Commands

### Start Development
```bash
npm start
```
This command starts both the development web server (budo) and the signaling server simultaneously. The web client runs on http://localhost:9966 and the signaling server runs on port 8080.

### Start Only Signaling Server
```bash
npm run signal
```

### Testing
Currently no test suite is implemented. The `npm test` command will fail with "Error: no test specified".

## Architecture Overview

### Core Components

1. **Main Entry Point (main.js)**
   - Handles WebSocket connection to signaling server
   - Manages peer connections using SimplePeer (WebRTC)
   - Implements OnionTransport class for anonymous peer discovery
   - Integrates with TorrentClient for file sharing

2. **Signaling Server (signaling-server.js)**
   - WebSocket server on port 8080
   - Facilitates peer discovery and WebRTC signaling
   - Assigns UUIDs to peers and manages peer registry
   - Announces new peers and handles disconnections

3. **Onion Routing (onion.js)**
   - Implements 3-hop circuit creation
   - Creates and peels onion-encrypted messages
   - Circuit class selects random peers for routing

4. **Cryptography (crypto.js)**
   - Uses TweetNaCl for end-to-end encryption
   - Provides generateKeyPair, encrypt, and decrypt functions
   - All peer communication is encrypted

5. **Torrent Client (torrent-client.js)**
   - Extends webtorrent-hybrid
   - Integrates onion transport for peer discovery
   - Handles torrent addition and wire protocol events

### Build System

The project uses Browserify with Babel for transpilation:
- **budo** serves the development version with live reload
- **babelify** transpiles ES6 modules to browser-compatible code
- The browserify transform configuration includes `webtorrent-hybrid` package in transpilation (not ignored from node_modules)

### Key Dependencies

- `webtorrent-hybrid`: Core torrenting engine supporting both WebRTC and TCP/UDP peers
- `simple-peer`: Simplified WebRTC peer connections
- `simple-websocket`: WebSocket wrapper
- `tweetnacl` & `tweetnacl-util`: Cryptography for end-to-end encryption
- `uuid`: Peer ID generation
- `ws`: WebSocket server implementation

## How It Works

1. **Peer Discovery**: Clients connect to signaling server and establish encrypted WebRTC connections
2. **Circuit Building**: For anonymous torrent peer discovery, clients build 3-hop circuits through other peers
3. **Onion Routing**: Discovery messages are wrapped in multiple layers of encryption and routed through circuits
4. **Direct Transfer**: Once peers are discovered, actual torrent data transfers directly via WebRTC (not through the circuit)

## Development Notes

- Minimum 4 browser tabs needed to demonstrate onion routing (requires 3+ peers for circuit building)
- The signaling server is only used for initial peer discovery and WebRTC signaling
- All peer-to-peer communication is end-to-end encrypted
- The onion transport is used specifically for torrent peer discovery, not data transfer

## Common Issues

Based on AGENTS.md, be aware that:
- Browserify transform configuration must be under the `"browserify"` key in package.json
- The `webtorrent-hybrid` package needs to be explicitly included in transpilation
- Build errors related to ES6 modules typically indicate Babel configuration issues