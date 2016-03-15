var express = require('express');
var router = express.Router();
var path = require('path');
var table = "attachments";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /attachment/###/.json */
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


/* GET API: /attachment/.json?item_id=### */
router.get('/\.json', checkAuth, function (req, res) {
    
    Item.findAll({
        include: [
            {
                model: Module,
                include: [
                    { model: Project }
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



/* GET API: /attachment/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


// ???
/* GET API: /attachment/### */
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


/* POST API: /attachment/ */
router.post('/', upload.single('file'), checkAuth, function (req, res) {
    logger.info(_spaceLoop(ErrorLevel.INFO), req.file);

    var file = req.file;
    console.log(file);
    sql = "INSERT INTO " + table + " (item_id, user_id, file_name, created_by, modified_by) VALUES (" +
        req.query.item_id + ", " +
        req.session.user_id + ", " +
        "'" + file.filename + "', " +
        req.session.user_id + ", " +
        req.session.user_id + ")";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });

    
    /*
    var fs = require("fs");
    var file = req.file.file;
    var path = req.file.path;
    var fsiz = req.file.size;
    var buffer = new Buffer(fsiz, "binary");

    fs.readFile(req.file.path, function (err, data) {
        if (err) throw err;
        
        console.log(data);
        sql = "INSERT INTO " + table + " (item_id, user_id, files, file_name, created_by, modified_by) VALUES (" +
            req.query.item_id + ", " +
            req.session.user_id + ", " +
            "'" + buffer.toString('hex') + "', " +
            "'" + req.file.filename + "', " +
            req.session.user_id + ", " +
            req.session.user_id + ")";
        logger.info(_spaceLoop(ErrorLevel.INFO), sql);
        db.query(sql, function (err, recordset) {
            console.log(err);
            if (err) res.sendStatus(400)
            else res.sendStatus(200); // equivalent to res.status(200).send('OK')
                
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
        });
    });
     */
});


/* DELETE API: /attachment/### */
router.delete('/:id', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "DELETE FROM " + table + " " +
        "WHERE id = " + req.params.id;
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.status(400).send(err['message']);
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


module.exports = router;