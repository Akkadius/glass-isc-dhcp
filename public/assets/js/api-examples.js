/**
 * Created by cmiles on 8/9/2017.
 */

function api_example(example) {
	switch(example) {
		case "get_active_leases":
			$.getJSON( "/api/get_active_leases", function( data ) {
				$("#get_active_leases").html('<pre>' + JSON.stringify(data, null, 2) + '</pre>').fadeOut(100).fadeIn(100);
			});
			break;
		case "get_subnet_details":
			$.getJSON( "/api/get_subnet_details", function( data ) {
				$("#get_subnet_details").html('<pre>' + JSON.stringify(data, null, 2) + '</pre>').fadeOut(100).fadeIn(100);
			});
			break;
		default:
			return;
	}
}

function clear_api(example) {
	$("#" + example).html('');
}