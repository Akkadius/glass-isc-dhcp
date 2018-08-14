/**
 * Created by cmiles on 9/21/2017.
 */

var express = require('express');
var router  = express.Router();

router.get('/', function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(oui_data));
});

module.exports = router;