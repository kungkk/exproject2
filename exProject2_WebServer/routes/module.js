var express = require('express');
var router = express.Router();
var path = require('path');
var table = "modules";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /module/###/.json */
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


/* GET API: /module/###/users/.json */
router.get('/:id/users/\.json', checkAuth, function (req, res) {
    var sub_sql = "SELECT user_id FROM members WHERE project_id IN (SELECT project_id FROM modules WHERE id = " + req.params.id + ")";

    
    var sql = "SELECT CASE WHEN mu.id IS NULL THEN 0 ELSE 1 END checkbox, " +
        "0 is_dirty, 0 is_dirty_put, '' http_method, " +
        "mu.id module_user_id, mu.hours, u.id user_id, u.username, u.email, u.family_name, u.given_name " +
        "FROM (SELECT * FROM users WHERE id IN (" + sub_sql + ")) u LEFT JOIN modules_users mu " +
        "ON u.id = mu.user_id " +
        "AND mu.module_id = " + req.params.id;
    
    sql = "SELECT a.* FROM (" + sql + ") a " +
        "ORDER BY a.checkbox DESC, a.username";
    
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) console.log(err['message']);
        res.json({ dataset: recordset });
        res.status(200);
    });

});


/* GET API: /module/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /module/### */
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


/* POST API: /module/?project_id=# */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " " +
        "WHERE project_id = " + req.query.project_id + " " +
        "AND name = '" + post.name + "' AND active = 1 ";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (project_id, user_id, name, created_by, modified_by) VALUES (" +
                req.query.project_id + ", " +
                req.session.user_id + ", " +
                "'" + post.name + "', " +
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
            res.status(400).send('Duplicate name on this project');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":DUPLICATE_NAME");
        }
    });    
});


/* POST API: /module/###/users */
router.post('/:id/users', checkAuth, function (req, res) {
    var post = req.body;
    //logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "";
    var sub_sql = "";
    var hours;
    
    for (i = 0; i < post.length; i++) {
        // reset sql
        sub_sql = "";
        logger.info(_spaceLoop(ErrorLevel.INFO), post[i]);
        
        hours = null;
        if (post[i].hours != null) hours = post[i].hours;

        switch (post[i].http_method) {
            case 'POST':
                sub_sql = "INSERT INTO modules_users (module_id, user_id, hours) VALUES (" +
                           req.params.id + ", " +
                           post[i].user_id + ", " +
                           hours + ");";
                break;
            case 'DELETE':
                sub_sql = "DELETE FROM modules_users WHERE id = " + post[i].module_user_id + ";";
                break;
            default:
                if (post[i].is_dirty_put == 1) {
                    sub_sql = "UPDATE modules_users SET hours = " + hours + " " +
                              "WHERE id = " + post[i].module_user_id + ";\r\n";
                }

                break;
        }
        
        if (sub_sql != "") {
            logger.info(_spaceLoop(ErrorLevel.INFO), sub_sql);
            sql = sql + sub_sql;
        }
    }
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


/* PUT API: /module/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var is_completed = 0;
    if (post.is_completed == true) is_completed = 1;
    
    var is_endless = 0;
    if (post.is_endless == true) is_endless = 1;

    var sql = "UPDATE " + table + " SET name = '" + post.name + "', " +
        "plan_started = '" + post.plan_started + time_started + "', " +
        "plan_ended = '" + post.plan_ended + time_ended + "', " +
        "started = '" + post.started + time_started + "', " +
        "ended = '" + post.ended + time_ended + "', " +
        "is_completed = " + is_completed + ", " +
        "is_endless = " + is_endless + ", " +
        "note = '" + post.note + "', " +
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


/* DELETE API: /module/### */
router.delete('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE " + table + " SET active = 0, " +
        "modified = " + get_db_datetime() + ", " +
        "modified_by = " + req.session.user_id + " " +
        "WHERE id = " + req.params.id;
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});

module.exports = router;