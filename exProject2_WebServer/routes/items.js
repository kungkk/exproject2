var express = require('express');
var router = express.Router();


var where_clause_builder = function (req) {
    var arrWhere = {};
    if (Object.keys(req.query).length === 0) {
        return { id: -1 };
    }
    else {
        for (var param in req.query) {
            console.log(param);
            switch (param) {
                case 'module_id':
                //case 'user_id':
                    arrWhere[param] = req.query[param];
                    break;
            }
        }
        arrWhere['user_id'] = req.session.user_id;
        
        if (typeof req.query.from_date != 'undefined' && typeof req.query.to_date != 'undefined') {
            var from_date = new Date(req.query.from_date + " 00:00:00");
            var to_date = new Date(req.query.to_date + " 23:59:59")
            arrWhere['created'] = { $between: [from_date, to_date] };
        }
        arrWhere['active'] = true;
		
		//logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));
        return arrWhere;
    }
}

/* GET API: /items/.json or /items/.json?module_id=### or /items/.json?user_id=### */
router.get('/\.json', checkAuth, function (req, res) {
    var arrWhere = where_clause_builder(req);
	
    Item.findAll({
        include: [
            { model: Attachment },
            { model: Issue },
            { model: User }
        ],
        where: arrWhere
    }).then(function (dataset) {
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /items */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


/* DELETE API: /items */
router.delete('/', checkAuth, function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "DELETE FROM items " +
        "WHERE id IN (" + post.toString() + ")";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')

        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});

module.exports = router;