import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export function generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    return {
        publicKey: naclUtil.encodeBase64(keyPair.publicKey),
        secretKey: naclUtil.encodeBase64(keyPair.secretKey)
    };
}

export function encrypt(message, theirPublicKey, ourSecretKey) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(message));
    const theirPublicKeyUint8 = naclUtil.decodeBase64(theirPublicKey);
    const ourSecretKeyUint8 = naclUtil.decodeBase64(ourSecretKey);

    const encrypted = nacl.box(messageUint8, nonce, theirPublicKeyUint8, ourSecretKeyUint8);

    return {
        nonce: naclUtil.encodeBase64(nonce),
        encrypted: naclUtil.encodeBase64(encrypted)
    };
}

export function decrypt(encryptedMessage, ourSecretKey, theirPublicKey) {
    const ourSecretKeyUint8 = naclUtil.decodeBase64(ourSecretKey);
    const theirPublicKeyUint8 = naclUtil.decodeBase64(theirPublicKey);
    const nonceUint8 = naclUtil.decodeBase64(encryptedMessage.nonce);
    const encryptedUint8 = naclUtil.decodeBase64(encryptedMessage.encrypted);

    const decrypted = nacl.box.open(encryptedUint8, nonceUint8, theirPublicKeyUint8, ourSecretKeyUint8);

    if (decrypted) {
        return JSON.parse(naclUtil.encodeUTF8(decrypted));
    } else {
        return null;
    }
}

