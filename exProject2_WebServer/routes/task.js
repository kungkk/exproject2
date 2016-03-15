var express = require('express');
var router = express.Router();
var path = require('path');
var table = "tasks";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /task/###/.json */
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


/* GET API: /task/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /task/### */
router.get('/:id', checkAuth, function (req, res) {
    res.locals.button = 'save';
    res.locals.layout = 'default';
    //if (req.xhr == true) res.locals.layout = 'ajax';
    //res.render(app.locals.action_name);

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


/* POST API: /task/?plan_id=# */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + 
        " WHERE plan_id = " + req.query.plan_id + " " +
        "AND module_id = " + post.module_id + " " +
        "AND user_id = " + req.session.user_id + " " +
        "AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (module_id, plan_id, user_id, started, ended, hours, created_by, modified_by) VALUES (" +
                post.module_id + ", " +
                req.query.plan_id + ", " +
                req.session.user_id + ", " +
                "'" + post.started + time_started + "', " +
                "'" + post.ended + time_ended + "', " +
                post.hours + ", " +
                req.session.user_id + ", " +
                req.session.user_id + ");";

            logger.info(_spaceLoop(ErrorLevel.INFO), sql);
            db.query(sql, function (err, recordset) {
                if (err) res.sendStatus(400)
                else res.sendStatus(200); // equivalent to res.status(200).send('OK')

                logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
            });
        }
        else {
            res.status(400).send('DUPLICATE_TASK');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":DUPLICATE_TASK");
        }
    });    
});


/* PUT API: /task/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE " + table + " SET started = '" + post.started + time_started + "', " +
        "ended = '" + post.ended + time_ended + "', " +
        "hours = " + post.hours + ", " +
        "modified = " + get_db_datetime() + ", " +
        "modified_by = " + req.session.user_id + " " +
        "WHERE id = " + req.params.id + " AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.status(400).send(err['message']);
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


/* DELETE API: /task/### */
router.delete('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "DELETE FROM " + table + " " +
        "WHERE id = " + req.params.id;
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});

module.exports = router;