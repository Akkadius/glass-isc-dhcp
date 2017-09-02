/**
 * Created by cmiles on 8/9/2017.
 */

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
	var request = req.body;
	var json_file = require('jsonfile');

	json_file.writeFile('./config/glass_config.json', request, {spaces: 2}, function(err) {
		console.error(err);
	});

	res.send('<script type="text/javascript">notification(\'Saved Config!\')</script>');
});

module.exports = router;