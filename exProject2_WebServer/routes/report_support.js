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

    var sql = "SELECT * FROM attributes WHERE table_name = 'users' AND key_id = " + req.session.user_id;
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
});


/* GET API: /report_support/email?year=###&week=###&user_id=### */
router.get('/email', checkAuth, function (req, res) {
    var arrWhere = where_clause_builder(req);
    
    var filepath = __dirname.replace("routes", "public\\uploads\\");
    
    send_email_variables(req);

    Item.findAll({
        include: [
            { model: Attachment }
        ],
        where: arrWhere,
        order: [['worked', 'ASC']]
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        
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
            to: to,
            cc: cc,
            bcc: bcc,
            subject: subject,
            html: '<b>Support Report</b>' // html body
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
});


/* GET API: /report_support */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;