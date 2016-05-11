var express = require('express');
var router = express.Router();
var path = require('path');
var table = "attributes";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /attribute/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});



// API: attribute/?table_name=##&key_id=##&key_name=xxx&key_name=xxx
/* POST API: /attribute/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + 
        " WHERE table_name = '" + req.query.table_name + "' " +
        "AND key_id = " + req.query.key_id + " " +
        "AND key_name = '" + req.query.key_name + "'";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (table_name, key_id, key_name, key_value, created_by, modified_by) VALUES (" +
                "'" + req.query.table_name + "', " +
                req.query.key_id + ", " +
                "'" + req.query.key_name + "', " +
                "'" + req.query.key_value + "', " +
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
            sql = "UPDATE " + table + " SET key_value = '" + req.query.key_value + "', " +
                "modified = " + get_db_datetime() + ", " +
                "modified_by = " + req.session.user_id + " " +
                "WHERE table_name = '" + req.query.table_name + "' " +
                "AND key_id = " + req.query.key_id + " " +
                "AND key_name = '" + req.query.key_id + "'";
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
    });    
});


module.exports = router;