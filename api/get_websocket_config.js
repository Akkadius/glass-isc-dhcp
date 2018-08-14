/**
 * Created by cmiles on 8/13/2018.
 */

var express   = require('express');
var router    = express.Router();

router.get('/', function (req, res, next) {
	var json_file    = require('jsonfile');
	var glass_config = json_file.readFileSync('config/glass_config.json');

	/**
	 * Config structure
	 *
	 * @type {{}}
	 */
	let websocket_config     = {};
	websocket_config.ws_port = glass_config.ws_port;

	/**
	 * Return response
	 */
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(websocket_config));
});

module.exports = router;