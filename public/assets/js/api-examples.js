/**
 * Created by cmiles on 8/9/2017.
 */

function api_example(example) {
    var start_time = new Date().getTime();

	switch(example) {
		case "get_active_leases":
            $("#get_active_leases").html(loader_html);
			$.getJSON( "/api/get_active_leases", function( data ) {
                var request_time = (new Date().getTime() - start_time) / 1000;
				$("#get_active_leases").html('Server Response Time: ' + request_time + 'ms <pre style="margin-top:20px">' + JSON.stringify(data, null, 2) + '</pre>');
			});
			break;
		case "get_subnet_details":
			$("#get_subnet_details").html(loader_html);
			$.getJSON( "/api/get_subnet_details", function( data ) {
                var request_time = (new Date().getTime() - start_time) / 1000;
				$("#get_subnet_details").html('Server Response Time: ' + request_time + 'ms <pre style="margin-top:20px">' + JSON.stringify(data, null, 2) + '</pre>');
			});
			break;
		default:
			return;
	}
}

function raw_api(call){
    switch(call) {
        default:
            var win = window.open(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + call, '_blank');
            win.focus();
            return;
    }
}

function clear_api(example) {
	$("#" + example).html('');
}