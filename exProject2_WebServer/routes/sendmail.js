var express = require('express');
var router = express.Router();

// @link http://www.nodemailer.com/
var nodemailer = require('nodemailer');


// GET home page. 
router.get('/', function (req, res) {
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.smtp.gmail.email,
            pass: config.smtp.gmail.password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'JCC Software Penang <' + config.smtp.gmail.email + '>', // sender address
        //to: 'kungkk@yahoo.com, kkk@jccsoftware.com', // list of receivers
        to: 'kungkk77@gmail.com',
        subject: 'Hello', // Subject line
        //text: 'Hello world', // plaintext body
        html: '<b>Hello world</b>' // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error(error);
        } else {
            logger.info(_spaceLoop(ErrorLevel.INFO), 'Message sent: ' + info.response);
        }
    });
    
    res.render('sendemail', { title: 'Send email' });
});

module.exports = router;
