var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../lib/render_template.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.url);

    res.send(
        template_render.get_index_template(
            '<script type="text/javascript">' +
            'get_dashboard(); get_stats();' +
            '</script>',
            req.url
        )
    );
});

module.exports = router;