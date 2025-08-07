import WebTorrent from 'webtorrent-hybrid';

export class TorrentClient {
    constructor() {
        this.client = new WebTorrent();
    }

    add(torrentId, onTorrent) {
        this.client.add(torrentId, torrent => {
            onTorrent(torrent);
        });
    }
}

