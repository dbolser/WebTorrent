import WebTorrent from 'webtorrent-hybrid';

export class TorrentClient extends WebTorrent {
    constructor(options) {
        super(options);
        this.onionTransport = options.onionTransport;
    }

    add(torrentId, onTorrent) {
      const torrent = super.add(torrentId, {}, onTorrent);
      if (this.onionTransport) {
          torrent.on('wire', (wire, addr) => {
              // Here we would use the onion transport to connect to the peer
              // For now, we'll just log it
              console.log(`Connecting to ${addr} via onion transport`);
              this.onionTransport.connect(addr, torrent);
          });
    }
      return torrent;
  }
}

