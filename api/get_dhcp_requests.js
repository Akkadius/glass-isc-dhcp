var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res, next) {

    var stat_data = dhcp_requests;

    for (var key in stat_data) {
        if(stat_data[key].request_count <= 1)
            delete stat_data[key];
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(stat_data));
});

module.exports = router;