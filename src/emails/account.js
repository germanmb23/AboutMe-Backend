const sgMail = require('@sendgrid/mail');
const constants = require('./../../constants');

const mailjet = require('node-mailjet').connect(constants.API_KEY_MAILJET, constants.API_SECRET_MAILJET);
const sendgridAPIKey = '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';

//sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.setApiKey(sendgridAPIKey);

// const sendMail = (mail, mailBody) => {
//   const msg = {
//     to: "germobe@gmail.com",
//     from: "germobe@gmail.com",
//     subject: "AboutMe mail from " + mail,
//     text: mailBody,
//   };

//   sgMail
//     .send(msg)
//     .then(() => {
//       console.log("Email sent");
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// };

const sendMail = async (mail, mailBody) =>
	await mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'germobe@gmail.com',
					Name: 'German',
				},
				To: [
					{
						Email: 'german.moreira.b@gmail.com',
						Name: 'German',
					},
				],
				Subject: 'AboutMe mail from ' + mail,
				//TextPart: mailBody,
				HTMLPart: mailBody,
				// HTMLPart:
				//   "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
				CustomID: 'AppGettingStartedTest',
			},
		],
	});

// sendMail
//   .then((result) => {
//     console.log(result.body);
//   })
//   .catch((err) => {
//     console.log(err.statusCode);
//   });

exports.sendMail = sendMail;
