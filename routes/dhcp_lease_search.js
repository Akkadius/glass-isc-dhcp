var express = require('express');
var router = express.Router();
var fs = require('fs');
var template_render = require('../core/render-template.js');

function human_time (time){
    var time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var date1 = time.getDate();
    var hour = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    return year + "-" + month+"-"+date1+" "+hour+":"+minutes+":"+seconds;
}

router.post('/', function(req, res, next) {
    var request = req.body;
    var search = request.search;

    dhcp_leases = template_render.get_template("dhcp_lease_search");

    table_data = '';

    var count = 0;
    for (var key in dhcp_lease_data) {

        var matcher = new RegExp(search, "i");

        // console.log(dhcp_lease_data[key]);

        if(!matcher.test(JSON.stringify(dhcp_lease_data[key])))
            continue;

        if(
            !matcher.test(dhcp_lease_data[key].mac_oui_vendor)
            && !matcher.test(dhcp_lease_data[key].host)
            && !matcher.test(key)
            && !matcher.test(dhcp_lease_data[key].mac)
            && !matcher.test(JSON.stringify(dhcp_lease_data[key].options, null, 2))
        )
            continue;

        table_row = '';
        table_row = table_row + '<td>' + key + '</td>';
        table_row = table_row + '<td>' + dhcp_lease_data[key].mac + '</td>';
        table_row = table_row + '<td>' + dhcp_lease_data[key].mac_oui_vendor + '</td>';
        table_row = table_row + '<td>' + (dhcp_lease_data[key].host ? dhcp_lease_data[key].host : '') + '</td>';
        table_row = table_row + '<td>' + human_time(dhcp_lease_data[key].start * 1000) + '</td>';
        table_row = table_row + '<td>' + human_time(dhcp_lease_data[key].end * 1000) + '</td>';
        table_row = table_row + '<td>' +
            '<button class="btn btn-default waves-effect option_data" lease="' + dhcp_lease_data[key].mac.split(":").join("") + '">Show</button>' +
            '<pre style="display:none;margin-top:10px" id="' + dhcp_lease_data[key].mac.split(":").join("") + '">' + JSON.stringify(dhcp_lease_data[key].options, null, 2) + '</pre>' +
            '</td>';

        table_data = table_data + '<tr>' + table_row + '</tr>';

        count++;

        if(count >= 10000){
            break;
        }

    }

    table_data = template_render.set_template_variable(dhcp_leases, "table_data", table_data);

    res.send(table_data);
});

module.exports = router;