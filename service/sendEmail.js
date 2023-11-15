const nodemailer = require("nodemailer")
require("dotenv").config()


module.exports = async (user, subject, text) => {
    try {
        console.log("inside email sending");
        let transporter = nodemailer.createTransport({

            host: process.env.HOST,
            port: process.env.MAILPORT,
            service: process.env.SERVICE,
            secure: false,
            auth: {
                user: `${process.env.USER}`,
                pass: 'twmm glcl hcon vndd'
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transporter.sendMail({

            from: process.env.USER,
            to: user,
            subject: subject,
            text: text

        })
        console.log(" email sent successfully");
    } catch (error) {
        console.log('email not sent');
        console.log(error)
    }
}