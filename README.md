# WebTorrent over Tor-like Network

This project is a 100% browser-based torrent client where all peer-to-peer
traffic is anonymized through a custom-built, Tor-like onion routing network.
The goal is to provide a private and secure torrenting experience that runs
entirely in a web browser with no installation required.


## Project Goal

Our objective is to create a torrent client that operates entirely within a web
browser, with the crucial feature that all its network traffic is anonymized,
similar to how the Tor network provides privacy. The idea is for a user to
simply open their browser to start torrenting privately.


## What We've Done So Far

1.  **Initial Research & Feasibility:**
    *   We started by researching existing technologies. We identified
        `WebTorrent` as the perfect library for handling torrents in the
        browser, as it uses WebRTC for peer-to-peer connections without needing
        any plugins.
    *   Our research into routing this traffic through the actual Tor network
        revealed that this is not currently possible directly from a browser due
        to security restrictions built into web standards.


2.  **First Approach: Building a Custom Anonymity Network:**
    *   Since we couldn't use the real Tor network, we pivoted to an ambitious
        plan: building our own "Tor-like" anonymity network from scratch, right
        in the browser.
    *   We successfully built a **WebRTC mesh network**, allowing different
        users' browsers to connect directly to each other.
    *   We created a **signaling server** to help peers discover each other and
        establish these connections.
    *   We implemented an **end-to-end encryption** layer using the `tweetnacl`
        cryptography library, ensuring all communication between peers was
        secure.
    *   On top of this secure layer, we built a functional **onion routing
        protocol**. This allowed us to wrap messages in multiple layers of
        encryption and send them through a multi-hop circuit of peers, ensuring
        the sender's identity was protected.


3.  **Second Approach: The Hybrid Model & Simplification:**
    *   While the custom anonymity network was a success, we realized that
        forcing all torrent data (which can be very high-volume) through our
        onion circuits would be slow and inefficient.
    *   We decided on a more practical "hybrid" approach. We will use our onion
        network to **anonymize the process of finding and connecting to other
        peers**, but the actual torrent data will be transferred directly for
        better performance.
    *   To prepare for this new approach, we have just cleaned up the project by
        removing the previous onion routing and signaling code. This gives us a
        clean, simple foundation to build upon.


## Current Status

Right now, the project is a functional, streamlined, browser-based torrent
client using the `webtorrent-hybrid` library. It can successfully download
torrents from the public BitTorrent network. We have a solid base to now build
our anonymity features back in, in a more targeted and efficient way.


## The Plan Forward

Now for the final and most exciting phase:

1.  **Re-introduce the Anonymity Layer:** We will bring back our battle-tested
    onion routing and secure messaging code.
2.  **Create a Custom WebTorrent Transport:** We will write a custom module that
    tells WebTorrent *how* to communicate with other peers.
3.  **Integrate Onion Routing with Peer Discovery:** This custom transport will
    use our onion network to find and connect to other peers. This means your IP
    address remains hidden during the most vulnerable part of the torrenting
    process.
4.  **Final Integration:** Once the custom transport is complete, we will have
    achieved our goal: a browser-based torrent client that uses a Tor-like
    network for anonymous and private peer connections, while still offering
    great download speeds.

