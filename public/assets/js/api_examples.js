/**
 * Created by cmiles on 8/9/2017.
 */

function api_example(example) {
	switch(example) {
		case "get_active_leases":
			$.getJSON( "/api/get_active_leases", function( data ) {
				$("#get-active-leases").html('<pre>' + JSON.stringify(data, null, 2) + '</pre>').fadeOut(100).fadeIn(100);
			});
		default:
			return;
	}
}