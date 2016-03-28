var express = require('express');
var router = express.Router();


/* GET signin. */
router.get('/', function (req, res) {
    logger.fatal(_spaceLoop(ErrorLevel.FATAL) + app.get('port'));
    logger.fatal(_spaceLoop(ErrorLevel.FATAL) + app.locals.port);
    //logger.fatal(_spaceLoop(ErrorLevel.FATAL) + process.env.PORT);
    
    res.render(app.locals.action_name);
});


// @link http://stackoverflow.com/questions/7990890/how-to-implement-login-auth-in-node-js/8003291#8003291
/* POST */
router.post('/', function (req, res) {
    var post = req.body;
    logger.fatal(_spaceLoop(ErrorLevel.FATAL), post);
    
    var hash = generateHash(post.password);
    //logger.info(_spaceLoop(ErrorLevel.INFO), hash);
    var sql = "SELECT * FROM users WHERE email = '" + post.email + "' AND password = '" + hash + "' AND active = 1;";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL), 'record:' + recordset.length);
        if (recordset.length > 0) {
            req.session.user_id = recordset[0].id;
            //req.session.username = post.username;
            req.session.username = recordset[0].username;
            req.session.email = recordset[0].email;
            req.session.given_name = recordset[0].given_name;
            req.session.family_name = recordset[0].family_name;
            
            sql = "INSERT INTO sessions (id, user_id, online, created_by, modified_by) VALUES (" +
                "'" + req.session.id + "', " +
                req.session.user_id + ", " +
                "1, " +
                req.session.user_id + ", " +
                req.session.user_id + ");";
            logger.info(_spaceLoop(ErrorLevel.INFO), sql);
            db.query(sql, function (err, recordset) {
                if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
            });
            
            // NOTE: client-side will do the redirection
            //res.send("ok");
            res.sendStatus(200); // equivalent to res.status(200).send('OK')
        }
        else {
            res.status(401).send('Invalid email or password');
        }
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


module.exports = router;