var express = require('express');
var router = express.Router();


router.get('/prepop/', function(req, res, next) {
    res.render('mkto_test/mktoCookiePrepop');
});

module.exports = router;
