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
                case 'table_name':
                case 'key_id':    
                    arrWhere[param] = req.query[param];
                    break;
            }
        }
        //arrWhere['active'] = true;
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));
        return arrWhere;
    }
}


/* GET API: /attributes/.json */
router.get('/\.json', checkAuth, function (req, res) {
    var arrWhere = where_clause_builder(req);
    logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));

    
    Attribute.findAll({
        where: arrWhere
    }).then(function (dataset) {
        console.log(dataset);
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
        res.json({ dataset: dataset });
        res.status(200);
    });
     
});


/* GET API: /attributes */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;