import { TorrentClient } from './torrent-client';

const torrentClient = new TorrentClient();

const addTorrentForm = document.getElementById('add-torrent-form');
addTorrentForm.addEventListener('submit', event => {
    event.preventDefault();
    const magnetLink = event.target['magnet-link'].value;
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
});

