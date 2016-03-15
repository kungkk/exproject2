var express = require('express');
var router = express.Router();
var path = require('path');
var table = "plans";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /plan/###/.json */
router.get('/:id\/\.json', checkAuth, function (req, res) {
    Plan.findAll({
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


/* GET API: /plan/###/tasks/.json */
router.get('/:id\/tasks/\.json', checkAuth, function (req, res) {
    Task.findAll({
        include: [
            {
                model: Module,
                include: [
                    { model: Project }
                ]
            },
        ],
        where: {
            plan_id: req.params.id,
            active: true
        }
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /plan/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /plan/### */
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


/* POST API: /plan/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " " +
        "WHERE user_id = " + req.session.user_id + " " + 
        "AND year = " + post.year + " " +
        "AND month = " + post.month + " " +
        "AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (user_id, year, month, created_by, modified_by) VALUES (" +
                req.session.user_id + ", " +
                post.year + ", " +
                post.month + ", " +
                req.session.user_id + ", " +
                req.session.user_id + ")";
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


module.exports = router;