var express = require('express');
var router = express.Router();


/* GET API: /permissions/.json */
router.get('/\.json', checkAuth, function (req, res) {
    Permission.findAll({
        include: [
            { model: Creator },
            { model: Modifier }
        ],
        where: {
            active: true
        },
        order: [['name', 'ASC']]
    }).then(function (dataset) {
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        res.json({ dataset: dataset });
        res.status(200);
    });    
});


/* GET API: /permissions */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


/* DELETE API: /permissions */
router.delete('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE permissions SET active = 0, " +
        "modified = " + get_db_datetime() + ", " +
        "modified_by = " + req.session.user_id + " " +
        "WHERE id IN (" + post.toString() + ")";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')

        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});

module.exports = router;