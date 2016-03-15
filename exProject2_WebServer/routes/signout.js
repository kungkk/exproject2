var express = require('express');
var router = express.Router();


/* GET API: /signout */
router.get('/', function (req, res) {
    delete req.session.username;
    res.redirect('/');
});


module.exports = router;