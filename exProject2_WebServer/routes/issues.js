﻿var express = require('express');
var router = express.Router();


var where_clause_builder = function (req) {
    var arrWhere = {};
    if (Object.keys(req.query).length === 0) {
        return { id: -1 };
    }
    else {
        for (var param in req.query) {
            switch (param) {
                case 'is_solved':
                case 'item_id':
                    arrWhere[param] = req.query[param];
                    break;
            }
        }
        arrWhere['user_id'] = req.session.user_id;
        arrWhere['active'] = true;
        
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));
        return arrWhere;
    }
}


/* GET API: /issues/.json */
router.get('/\.json', checkAuth, function (req, res) {
    var arrWhere = where_clause_builder(req);

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
        where: arrWhere
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /issues */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


/* DELETE API: /issues */
router.delete('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "DELETE FROM issues " + 
        "WHERE id IN (" + post.toString() + ")";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')

        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});

module.exports = router;