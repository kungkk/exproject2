var express = require('express');
var router = express.Router();
var path = require('path');


/* GET API: /config/.json */
router.get('/\.json', function (req, res) {
    res.json({ dataset: config });
    res.status(200);
});


/* GET API: /config/ */
router.get('/', function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* PUT API: /config/ */
router.put('/:id', function (req, res) {
    var post = req.body;
    logger.info(_spaceLoop(ErrorLevel.INFO), post);
});


module.exports = router;