
const nodemailer = require('nodemailer');
const Boom = require("@hapi/boom");
const google_mail = async (reciver_address, template, data, credits, subject, attachment) => {
    try {
        let credit_data = JSON.parse(credits.records[0].details)
        let credit = {
            host: credit_data.host,
            port: credit_data.port,
            auth: {
                user: credit_data.user,
                pass: credit_data.pass
            }
        }

        const transporter = nodemailer.createTransport(credit);
        let mailOptions = {
            from: credit_data.user,
            subject: subject,
            to: reciver_address,
            html: template,

        };
        if (attachment === "1") {
            // mailOptions['attachments'] = [
            //     {
            //         filename: 'logo.png',
            //         path: Path.join(__dirname, '../templates/logo.png'),
            //         cid: 'image1@myapp.com'
            //     }
            // ]
        }
        let mailres = await transporter.sendMail(mailOptions);
        if (mailres) {
            let output = {
                statusCode: 200,
                message: 'Email sent successfully!'
            }
            return output;
        } else {
            return Boom.badRequest('bad request');
        }

    } catch (err) {
        console.log("error", error);
        let error = Boom.badImplementation('Bad implementation');
        return error
    }
}

module.exports = { google_mail };