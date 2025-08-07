# WebTorrent over Tor-like Network

This project is a 100% browser-based torrent client where peer discovery is anonymized through a custom-built, Tor-like onion routing network. The goal is to provide a private and secure torrenting experience that runs entirely in a web browser with no installation required.

## How it Works

This project uses a hybrid model to provide both anonymity and performance.

*   **Anonymized Peer Discovery:** When a user wants to download a torrent, the client uses a custom-built, Tor-like onion routing network to find and connect to other peers. This process wraps the discovery traffic in multiple layers of encryption and routes it through a circuit of other users in the network, effectively hiding the user's IP address.

*   **Direct Data Transfer:** Once peers are securely and anonymously connected, the actual high-volume torrent data is transferred directly between them using standard WebRTC. This ensures that download speeds are not bottlenecked by the onion routing network.

*   **Technology Stack:**
    *   **`webtorrent-hybrid`**: The core torrenting engine, capable of connecting to both WebRTC and standard TCP/UDP peers.
    *   **`simple-peer`**: A library that simplifies WebRTC peer-to-peer connections.
    *   **`tweetnacl`**: A high-security, audited cryptography library for end-to-end encryption and onion wrapping.
    *   **Custom Signaling Server**: A lightweight `ws` (WebSocket) server that bootstraps new users into the peer-to-peer network.

## Key Features

*   **100% Browser-Based**: No installation required. Just open a web page.
*   **Anonymous Peer Discovery**: Your IP address is hidden when connecting to other torrent peers.
*   **Decentralized**: The system is designed to be resilient, with no central point of failure.
*   **High Performance**: By using direct WebRTC for data transfer, it maintains fast download speeds.

## How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Application:**
    ```bash
    npm start
    ```
    This command starts both the development web server and the signaling server.

3.  **Use the Client:**
    *   Open your web browser and navigate to `http://localhost:9966`.
    *   To see the peer-to-peer networking in action, open at least two browser tabs to the same address.
    *   To see the onion routing in action (which requires at least 3 peers to build a circuit), open four or more tabs.
    *   Paste a magnet link into the input field and click "Add Torrent" to begin downloading.
