const sgMail = require('@sendgrid/mail');
const accountSid = process.env.TwilioAccountSid;
const authToken = process.env.TwilioAccountToken;

const client = require('twilio')(accountSid, authToken);

sgMail.setApiKey(process.env.SendGridAPIKey);

exports.sendEmailUsingTemplate = (to, templateId, dynamic_template_data) => {
    dynamic_template_data.websiteName = "My Machine Online";
    const msg = {
        to,
        from: {
            name: process.env.SenderName,
            email: process.env.SenderEmail
        },
        templateId,
        dynamic_template_data,
        hideWarnings: true
    };
    sgMail.send(msg)
        .then((response) => {
            console.log('Email sent successfully');
        })
        .catch((error) => {
            console.error('Send grid error: ', error.toString());
        });
};

exports.sendMobileText = (to, message) => {
    client.messages
        .create({
            from: process.env.TwilioPhoneNumber,
            to: to,
            body: message,
        })
        .then(message => console.log(message.sid));
};