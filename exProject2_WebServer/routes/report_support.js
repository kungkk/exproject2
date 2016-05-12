var express = require('express');
var router = express.Router();

// @link http://www.nodemailer.com/
var nodemailer = require('nodemailer');


var started;
var ended;
to = "";
cc = "";
bcc = "";


var where_clause_builder = function (req) {
    var arrWhere = {};

    if (Object.keys(req.query).length === 0) {
        return { id: -1 };
    }
    else {
        for (var param in req.query) {
            switch (param) {
                case 'item_id':
                    arrWhere['id'] = req.query[param];
                    break;
            }
        }
        arrWhere['active'] = true;
        
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));
        return arrWhere;
    }
}


var send_email_variables = function (req) {
    to = "";
    cc = "";
    bcc = "";

    var sql = "SELECT * FROM attributes WHERE table_name = 'modules' AND key_id = " + req.query.module_id;
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));

        for (i = 0; i < dataset.length; i++) {
            //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset[i], null, '    '));
            
            console.log(dataset[i]['key_name']);

            switch (dataset[i]['key_name']) {
                case 'to':
                    to = dataset[i]['key_value'];
                    break;
                case 'cc':
                    cc = dataset[i]['key_value'];
                    break;
                case 'bcc':
                    bcc = dataset[i]['key_value'];
                    break;
            }
        }

        //console.log(to);
        //console.log(cc);
        //console.log(bcc);
    });
}


/* GET API: /report_support/.json?item_id=### */
router.get('/\.json', checkAuth, function (req, res) {
    if (req.query.item_id != undefined) {
        var arrWhere = where_clause_builder(req);

        Item.findAll({
            include: [
                {
                    model: Module,
                    include: [
                        { model: Project }
                    ]
                }
            ],
            where: arrWhere
        }).then(function (dataset) {
            //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
            res.json({ dataset: dataset });
            res.status(200);
        });
    }

    if (req.query.module_id != undefined) {
        Attribute.findAll({
            where: {
                table_name: 'modules',
                key_id: req.query.module_id
            }
        }).then(function (dataset) {
            //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
            res.json({ dataset: dataset });
            res.status(200);
        });        
    }
});


/* GET API: /report_support/email?item_id=### */
router.get('/email', checkAuth, function (req, res) {
    var post = req.body;
    
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
        
    var subject = 'Support Report ' + req.session.given_name + ', ' + req.session.family_name + ' W' + req.query.year + req.query.week;
        
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: 'JCC Software <' + config.smtp.gmail.email + '>', // sender address
        to: post.to,
        cc: post.cc,
        bcc: post.bcc,
        subject: post.subject,
        html: post.body
    };
        
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error(error);
        } else {
            logger.info(_spaceLoop(ErrorLevel.INFO), 'Message sent: ' + info.response);
            res.status(200);
            res.end();
        }
    });
});


/* GET API: /report_support */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;