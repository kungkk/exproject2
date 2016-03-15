var express = require('express');
var router = express.Router();


/* GET API: /history/.json?module_id=## or /history/.json?project_id=## */
router.get('/\.json', checkAuth, function (req, res) {
    var sql;

    if (Object.keys(req.query).length === 0) {
        // do nothing
    }
    else {
        for (var param in req.query) {
            switch (param) {
                // API: /history/.json?module_id=##
                case 'module_id':
                    sql = "SELECT mh.*, (SELECT name FROM projects WHERE mh.project_id = id) project_name, " + 
                        "(SELECT username FROM users WHERE mh.user_id = id) username " +
                        "FROM modules_history mh " +
                        "WHERE mh.module_id = " + req.query.module_id;
                    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
                    db.query(sql, function (err, recordset) {
                        if (err) console.log(err['message']);
                        res.json({ dataset: recordset });
                        res.status(200);
                    });
                    break;
                // API: /history/.json?project_id=##
                case 'project_id':
                    sql = "SELECT ph.*, (SELECT name FROM projects WHERE ph.project_id = id) project_name, " + 
                        "(SELECT username FROM users WHERE ph.user_id = id) username " +
                        "FROM projects_history ph " +
                        "WHERE ph.project_id = " + req.query.project_id;
                    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
                    db.query(sql, function (err, recordset) {
                        if (err) console.log(err['message']);
                        res.json({ dataset: recordset });
                        res.status(200);
                    });
                    break;
            }
        }
    }
});


/* GET API: /history */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;