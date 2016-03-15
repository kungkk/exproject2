var express = require('express');
var router = express.Router();
var path = require('path');
var table = "projects";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /project/###/.json */
router.get('/:id\/\.json', checkAuth, function (req, res) {
    
    //{ model: Member },
    //include: [
    //    { model: Issue }
    //]
    
    var from_date = new Date(req.query.from_date + " 00:00:00");
    var to_date = new Date(req.query.to_date + " 23:59:59")
    
    // @link http://docs.sequelizejs.com/en/latest/docs/models-usage/#nested-eager-loading
    Project.findAll({
        include: [
            {
                model: Member,
                include: [
                    { model: User }
                ]
            },
            {
                model: Module,
                include: [
                    {
                        model: Item,
                        include: [
                            { model: Attachment },
                            { model: Issue },
                            { model: User }
                        ],
                        required: false,
                        order: 'created',
                        where: {
                            user_id: req.session.user_id,
                            worked: {
                                $between: [from_date, to_date]
                            }
                        },
                    },
                    {
                        model: ModuleUser,
                        include: [
                            { model: User }
                        ],
                    }
                ]
            },
        ],
        where: {
            id: req.params.id,
            active: true
        }
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /project/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /project/### */
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


/* POST API: /project/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " WHERE name = '" + post.name + "' AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (user_id, code, name, plan_started, plan_ended, started, ended, created_by, modified_by) VALUES (" +
                req.session.user_id + ", " +
                "'" + post.code + "', " +
                "'" + post.name + "', " +
                "'" + post.plan_started + time_started + "', " +
                "'" + post.plan_ended + time_ended + "', " +
                "'" + post.started + time_started + "', " +
                "'" + post.ended + time_ended + "', " +
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
            res.status(400).send('Duplicate project name');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":Duplicate project name");
        }
    });    
});


/* PUT API: /project/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE " + table + " SET code = '" + post.code + "', " +
        "name = '" + post.name + "', " +
        "plan_started = '" + post.plan_started + time_started + "', " +
        "plan_ended = '" + post.plan_ended + time_ended + "', " +
        "started = '" + post.started + time_started + "', " +
        "ended = '" + post.ended + time_ended + "', " +
        "note = '" + post.note + "', " +
        "modified = " + get_db_datetime() + ", " +
        "modified_by = " + req.session.user_id + " " +
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


/* DELETE API: /project/### */
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