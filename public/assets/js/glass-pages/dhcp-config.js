$('#dhcp_config').height($(window).height() * 0.6);

var dhcp_config = ace.edit("dhcp_config");
dhcp_config.setTheme("ace/theme/terminal");
dhcp_config.$blockScrolling = Infinity;

function save_dhcp_config () {
	dhcp_config_form_data = get_form_query_string("dhcp_config_form");
	dhcp_config_form_data = dhcp_config_form_data + "&dhcp_config_data=" + encodeURIComponent(dhcp_config.getValue());

	$.post( "/dhcp_config_save", dhcp_config_form_data, function( data ) {
		$( "#dhcp_config_result" ).html( data );
	});
}