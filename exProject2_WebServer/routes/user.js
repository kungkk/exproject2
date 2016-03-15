var express = require('express');
var router = express.Router();
var path = require('path');
var table = "users";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /user/###/.json */
router.get('/:id\/\.json', checkAuth, function (req, res) {
    var sql = sql_builder(req.params.id);
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    // @link http://stackoverflow.com/questions/16041341/read-result-from-an-exported-function-callback
    db.query(sql, function (err, recordset) {
        if (err) console.log(err['message']);
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /user/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /user/### */
router.get('/:id', checkAuth, function (req, res) {
    res.locals.button = 'save';
    res.locals.layout = 'default';
    
    var sql = sql_builder(req.params.id);
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    // @link http://stackoverflow.com/questions/16041341/read-result-from-an-exported-function-callback
    db.query(sql, function (err, recordset) {
        if (err) {
            logger.error(_spaceLoop(ErrorLevel.ERROR) + err);
            res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
            return;
        }
        
        if (recordset.length > 0) {
            if (req.xhr == true) res.locals.layout = 'ajax';
            res.render(app.locals.action_name);
        }
        else {
            res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
        }
    });    
});


/* POST API: /user/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " WHERE username = '" + post.username + "' AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            var hash = generateHash(post.password);
            sql = "INSERT INTO " + table + " (username, password, email, family_name, given_name) VALUES (" +
                "'" + post.username + "', " +
                "'" + hash + "', " +
                "'" + post.email + "', " +
                "'" + post.family_name + "', " +
                "'" + post.given_name + "');";
            logger.info(_spaceLoop(ErrorLevel.INFO), sql);
            db.query(sql, function (err, recordset) {
                if (err) {
                    res.sendStatus(400)
                }
                else {
                    res.sendStatus(200); // equivalent to res.status(200).send('OK')
                }

                logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
            });
        }
        else {
            res.status(400).send('DUPLICATE_USERNAME');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":DUPLICATE_USERNAME");
        }
    });    
});


/* PUT API: /user/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE " + table + " SET email = '" + post.email + "', " +
        "family_name = '" + post.family_name + "', " +
        "given_name = '" + post.given_name + "', " +
        "modified = " + get_db_datetime() + " " +
        "WHERE id = " + req.params.id + " AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) {
            res.sendStatus(400)
        }
        else {
            res.sendStatus(200); // equivalent to res.status(200).send('OK')
        }
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


module.exports = router;