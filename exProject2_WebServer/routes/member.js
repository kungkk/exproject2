var express = require('express');
var router = express.Router();
var path = require('path');
var table = "members";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /member/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});



// API: member/?project_id=##&user_id=##&project_leader=#
/* POST API: /member/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + 
        " WHERE project_id = " + req.query.project_id + " " +
        "AND user_id = " + post.user_id + " AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            //var hash = generateHash(post.password);
            sql = "INSERT INTO " + table + " (project_id, user_id, created_by, modified_by) VALUES (" +
                req.query.project_id + ", " +
                post.user_id + ", " +
                req.session.user_id + ", " +
                req.session.user_id + ");";
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


/* PUT API: /member/###/?project_id=##&project_leader=# */
router.put('/:id', checkAuth, function (req, res) {
    var sql = "UPDATE " + table + " SET project_leader = 0, " +
        "modified = " + get_db_datetime() + ", " +
        "modified_by = " + req.session.user_id + " " +
        "WHERE project_id = " + req.query.project_id + ";";
    sql = sql + "UPDATE " + table + " SET project_leader = 1, " +
        "modified = " + get_db_datetime() + " " +
        "modified_by = " + req.session.user_id + " " +
        "WHERE id = " + req.params.id + ";";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) {
            res.sendStatus(400)
        }
        else {
            res.sendStatus(200); // equivalent to res.status(200).send('OK')
            send_udp_message(table);
        }
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


/* DELETE API: /member/### */
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