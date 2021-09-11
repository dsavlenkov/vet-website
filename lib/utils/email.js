const nodemailer = require('nodemailer')
const config = require('./config')

let transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    pool: true,
    auth: {
        user: config.email.username,
        pass: config.email.password,
    },
});

async function sendSelfMessage(message) {
    let email = config.email.username;
    return await transporter.sendMail({
        from: `"vet-website" <${email}>`,
        to: email,
        subject: 'Message from vet-website',
        text: message,
    }).catch(console.error);
}

module.exports = sendSelfMessage;