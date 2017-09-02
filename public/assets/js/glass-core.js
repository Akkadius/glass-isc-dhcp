/**
 * Created by cmiles on 8/9/2017.
 */

function get_form_query_string(form_id){
	query_string = "";
	$('#' + form_id).find('input, select, textarea').each(function (key) {
		val = $(this).val();
		if (val == 'undefined') {
			val = '';
		}
		if($(this).attr('type') == "checkbox"){
			if (!$(this).is(':checked')) {
				val = 0;
			}
		}
		query_string = query_string + "&" + $(this).attr('id') + "=" + encodeURIComponent(val);
	});
	return query_string;
}

function save_config() {
	glass_settings = get_form_query_string("glass-settings-form");

	$.post( "/glass_settings_save", glass_settings, function( data ) {
		$( "#glass_settings_result" ).html( data );
	});
}

function notification(text){
	colorName = 'bg-black';
	animateEnter = 'animated fadeInDown';
	animateExit = 'animated fadeOutUp';
	var allowDismiss = true;

	$.notify({
			message: text
		},
		{
		type: colorName,
		allow_dismiss: allowDismiss,
		newest_on_top: true,
		timer: 1000,
		animate: {
			enter: animateEnter,
			exit: animateExit
		},
		template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
		'<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
		'<span data-notify="icon"></span> ' +
		'<span data-notify="title">{1}</span> ' +
		'<span data-notify="message">{2}</span>' +
		'<div class="progress" data-notify="progressbar">' +
		'<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
		'</div>' +
		'<a href="{3}" target="{4}" data-notify="url"></a>' +
		'</div>'
	});
}