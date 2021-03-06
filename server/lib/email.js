const nodemailer = require('nodemailer');

let transport;
let sendFn;

function sendEmail(emailOptions, templateData, callback) {
  sendFn(emailOptions, templateData, callback);
}

module.exports = function configure(smtpConfig, templates) {
  transport = nodemailer.createTransport(smtpConfig);
  sendFn = transport.templateSender(templates);
  return {
    sendEmail
  };
};
