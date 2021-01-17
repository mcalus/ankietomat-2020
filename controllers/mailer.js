var nodemailer = require('nodemailer')

exports.sendMail = async function(request, to, subject, body){
	var transporter = nodemailer.createTransport({
        // service: request.app.locals.config.mailer.service,
        host: request.app.locals.config.mailer.host,
        port: request.app.locals.config.mailer.port,
        secure: request.app.locals.config.mailer.secure,
        auth: {
            user: request.app.locals.config.mailer.login,
            pass: request.app.locals.config.mailer.password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
      
    var mailOptions = {
        from: request.app.locals.config.mailer.login,
        to: to,
        subject: subject,
        text: body,
        html: body
    };

    // let info = await transporter.sendMail(mailOptions)
    // console.log(info)
    // return info
    
    return transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error)
            return error
        } else {
            console.log(info)
            return info
            return true
        }
    });
}