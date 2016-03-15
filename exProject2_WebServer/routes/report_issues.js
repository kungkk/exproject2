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
                case 'is_solved':
                case 'user_id':
                    arrWhere[param] = req.query[param];
                    break;
            }
        }
        arrWhere['active'] = true;
        return arrWhere;
    }
}

// /report_issues/.json?user_id=### or /report _issues/.json?user_id=###&is_solved=false or /report_issues/.json?user_id=###&is_solved=true
/* GET API: /report_issues/.json */
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
            },
        ],
        where: arrWhere
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /report_issues */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;