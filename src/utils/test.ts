
// var keypair = require('keypair');
// var gcm = require('node-aes-gcm')
// const iv = Buffer.from('dMailBackend')
// const secreteKey = Buffer.from('8OvimDI2vztGE4q8')

// var pair = keypair(1024);
// // console.log(JSON.stringify({
// //     command: "SetConnectinoPubKey",
// //     data: pair.public.slice(31, -30)
// // }))
// // console.log(JSON.stringify({
// //     command: "SetConnectinoPubKey",
// //     data: pair.public.slice(31, -30).replace(/[\r\n]/g, '')
// // }))
// const t = {
//     value: 10,
//     command: "dad"
// }
// const ts = JSON.stringify(t)
// console.log(ts)
// const e = gcm.encrypt(secreteKey, iv, Buffer.from(ts), Buffer.from(''))
// const n = gcm.decrypt(secreteKey, iv, e.ciphertext, Buffer.from(''), Buffer.from('0123456789abcdef'))
// console.log(n.plaintext.toString())
// const forge = require('node-forge')
// const key = Buffer.from('37MmOADe+OYXuMSy', 'base64')
// const iv = Buffer.from('dMailBackend')
// /* alternatively, generate a password-based 16-byte key
// var salt = forge.random.getBytesSync(128);
// var key = forge.pkcs5.pbkdf2('password', salt, numIterations, 16);
// */

// // encrypt some bytes using CBC mode
// // (other modes include: ECB, CFB, OFB, CTR, and GCM)
// // Note: CBC and ECB modes use PKCS#7 padding as default
// var cipher = forge.cipher.createCipher('AES-GCM', key);
// cipher.start({iv: iv});
// cipher.update(Buffer.from("hahaha"));
// cipher.finish();
// var encrypted = cipher.output;
// // outputs encrypted hex
// console.log(encrypted.toHex());
















export {}