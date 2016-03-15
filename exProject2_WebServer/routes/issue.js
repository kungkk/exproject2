var express = require('express');
var router = express.Router();
var path = require('path');
// @link http://momentjs.com
var moment = require('moment');
var table = "issues";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /issue/###/.json */
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


/* GET API: /issue/.json?item_id=### */
router.get('/\.json', checkAuth, function (req, res) {
    
    Issue.findAll({
        include: [
            {
                model: Item,
                include: [
                    {
                        model: Module,
                        include: [
                            { model: Project }
                        ]
                    }
                ]
            }
        ],
        where: {
            item_id: req.query.item_id,
            active: 1
        }
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        
        res.json({ dataset: dataset });
        res.status(200);
    });    
});



/* GET API: /issue/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /issue/### */
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


/* POST API: /issue/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " WHERE name = '" + post.name + "' AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (item_id, user_id, name, description, created_by, modified_by) VALUES (" +
                req.query.item_id + ", " +
                req.session.user_id + ", " +
                "'" + post.name + "', " +
                "'" + post.description + "', " +
                req.session.user_id + ", " +
                req.session.user_id + ")";
            logger.info(_spaceLoop(ErrorLevel.INFO), sql);
            db.query(sql, function (err, recordset) {
                if (err) res.sendStatus(400)
                else res.sendStatus(200); // equivalent to res.status(200).send('OK')

                logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
            });
        }
        else {
            res.status(400).send('DUPLICATE_NAME');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":DUPLICATE_NAME");
        }
    });    
});


/* PUT API: /issue/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
//    "modified = " + get_db_datetime() + " " +
//    "modified = '" + moment().format('YYYY-MM-DD hh:mm:ss') + "' " +
    
    var sql = "UPDATE " + table + " SET name = '" + post.name + "', " +
        "description = '" + post.description + "', " +
        "is_solved = " + post.is_solved + ", " +
        "due_date = '" + post.due_date + time_ended + "', " +
        "solved_note = '" + post.solved_note + "', " +
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


/* DELETE API: /issue/### */
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