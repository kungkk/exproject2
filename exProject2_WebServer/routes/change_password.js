var express = require('express');
var router = express.Router();


/* GET /change_password */
router.get('/', checkSession, function (req, res) {
    //res.render('signin');
    res.render(app.locals.action_name);
});


/* POST /change_password */
router.post('/', checkSession, function (req, res) {
    var post = req.body;
    logger.fatal(_spaceLoop(ErrorLevel.FATAL), post);
    
    if (post.new_password == post.confirm_password) {
        var hash = generateHash(post.current_password);
        var sql = "SELECT * FROM users WHERE username = '" + req.session.username + "' AND password = '" + hash + "' AND active = 1;";
        logger.info(_spaceLoop(ErrorLevel.INFO), sql);
        
        db.query(sql, function (err, recordset) {
            if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
            
            logger.fatal(_spaceLoop(ErrorLevel.FATAL), 'record:' + recordset.length);
            if (recordset.length > 0) {
                var new_hash = generateHash(post.new_password);
                sql = "UPDATE users SET password = '" + new_hash + "' " +
                    "WHERE username = '" + req.session.username + "';";
                logger.info(_spaceLoop(ErrorLevel.INFO), sql);
                db.query(sql, function (err, recordset) {
                    if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
                    
                    // NOTE: client-side will do the redirection
                    res.sendStatus(200); // equivalent to res.status(200).send('OK')
                });
            }
            else {
                res.status(401).send('INVALID_CURRENT_PASSWORD');
            }
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
        });
    }
    else {
        res.status(403).send('PASSWORDS_MISMATCH');
    }
});


module.exports = router;