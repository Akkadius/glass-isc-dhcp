/**
 * Created by cmiles on 3/13/2015.
 * Custom pjax framework used for years
 */
var pjax_request_count = 1;
var pjax_debug = 1;

var pjax_cache = [];
var ignore_cache = 1;
var ignore_popstate = 0;

var window_scroll_position = [];
var last_navigated_url = document.location.href.split('#')[0];

var scroll_target = window; /* Default */
// var scroll_target = '.dx-main';
var pjax_scroll_offset = 15;


function pjax_console(message){
	console.log("%c[pjax] " + message, 'background: #222; color: #bada55');
}

$('body').on('click', 'a', function (e) {
	url = $(this).attr('href');

	/* Make sure we have a valid href link */
	if(!$(this).attr('href')){
		return;
	}

	if(url.indexOf('javascript:;') != -1) {
		return;
	}

	if($(this).attr('ignore-pjax')){
		ignore_popstate = 1;
		return;
	}

	/* Ignore anchors with targets... */
	if($(this).attr('target')){
		return;
	}

	if(pjax_debug){ pjax_console('Clicking :: ' + url); }

	/* Ignore anchors with # references */
	if(url.indexOf('#') != -1){
		if(pjax_debug){ pjax_console('# trigger'); }
		return;
	}
	

	var extension = url.split('.').pop();

	pjax_console('url ' + url);
	pjax_console('extension ' + extension);

	if ($(this).attr("pjax")){
		request_url = $(this).attr('href');

		if(pjax_debug){  pjax_console('request_url ' + request_url); }

		do_pjax_request(request_url);

		return false;
	}
});

function do_pjax_request(request_url){

	/* Destroy some dynamically spawned assets */

	$('#body-content').css("opacity", ".1");

	if(pjax_cache[request_url] && ignore_cache != 1){
		if (typeof e !== 'undefined') {
			e.preventDefault();
		}
		e_res = pjax_cache[request_url];

		/* Way of restoring scroll position */
		window_scroll_position[window.location] = $(scroll_target).scrollTop();
		if(pjax_debug){ pjax_console('Window location :: ' + window.location + ' scroll position ' + $(scroll_target).scrollTop()); }

		/* Push into browser history */
		history.pushState('page_pop', request_url, request_url);

		/* Push loaded content */
		$('#body-content').css("opacity", "1");
		$('#body-content').html(e_res);

		$(scroll_target).animate({scrollTop: 0}, 100);

		$( document ).trigger( "on_pjax_complete");

		last_navigated_url = request_url;

		if(pjax_debug){  pjax_console('loaded cached ' + request_url); }
		return false;
	}

	if (history.pushState) {
		if(pjax_debug){ pjax_console('loading page into push_state'); }

		$.ajax({
			url: request_url + '?v_ajax',
			context: document.body,
		}).done(function (e_res) {
			if (typeof e !== 'undefined') {
				e.preventDefault();
			}

			/* Push into browser history */
			history.pushState('page_pop', request_url, request_url);

			$('#body-content').css("opacity", "1");
			$('#body-content').html(e_res);

			$( document ).trigger( "on_pjax_complete");


			/* Cache the result */
			pjax_cache[request_url] = e_res;

			/* Way of restoring scroll position */
			window_scroll_position[window.location] = $(scroll_target).scrollTop();
			if(pjax_debug){ pjax_console('Window location :: ' + window.location + ' scroll position ' + $(scroll_target).scrollTop()); }

			last_navigated_url = request_url;

			/* Set new page scroll position to 0 */
			// document.body.scrollTop = document.documentElement.scrollTop = 0;
			// $(scroll_target).scrollTop(0);
			$(scroll_target).animate({scrollTop: 0}, 100);

		});

		pjax_request_count++;
		if(pjax_debug){ pjax_console('request count ' + pjax_request_count); }
	}

}

function scroll_to_hash() {
	if(typeof hash_id != 'undefined'){
		if(hash_id.length > 1){
			anchor = $("#" + hash_id);
			if(anchor.length > 0){
				if(pjax_debug){ pjax_console('hash location restore to anchor "' + hash_id + '" Location: ' + anchor.offset().top); }
				// $(window).scrollTop(anchor.offset().top - scroll_offset);

				anchor_offset = anchor.offset().top;

				setTimeout(function() {
					if(anchor.length > 0) {
						pjax_console('anchor offset ' + anchor_offset + ' pjax_scroll_offset: ' + pjax_scroll_offset);
						$(scroll_target).scrollTop((anchor_offset - pjax_scroll_offset));

						anchor.effect("highlight", {}, 500);
					}
				} , 1);
			}
		}
		else {
			/* Scroll to 0 - Top */
			setTimeout(function() {
				$(scroll_target).scrollTop(0);
			} , 5);
		}
	}
}

function restore_pop_state_content(state_destination, content){
	if(pjax_debug){ pjax_console('pjax popstate cache'); }

	/* Push the content */
	$('#body-content').html(content);

	/* Restore scroll position */
	if(typeof window_scroll_position[state_destination] != 'undefined'){

		if(pjax_debug){ pjax_console("Restoring scroll position for " + state_destination + ' at ' + window_scroll_position[state_destination]); }

		/* Scroll to restored position - Top */
		setTimeout(function() {
			$(scroll_target).scrollTop(window_scroll_position[state_destination]);
		} , 10);
	}

	/* If we have a hash location - let's restore it */
	scroll_to_hash();

	last_navigated_url = state_destination;
}

window.addEventListener("popstate", function(e) {
	state_destination = document.location.href;

	if(ignore_popstate == 1){
		ignore_popstate = 0;
		pjax_console('popstate trigger ignore_popstate');
		hash_id = document.location.href.split('#')[1];
		// scroll_to_hash();
		e.preventDefault();
		return;
	}

	if(pjax_debug){  pjax_console('' + state_destination); }

	hash_id = "";

	if (state_destination) {
		if (state_destination.indexOf('#') != -1) {
			state_destination = document.location.href.split('#')[0];
			hash_id = document.location.href.split('#')[1];
			// return;
			if(pjax_debug){  pjax_console('hash_id ' + hash_id); }
			if(pjax_debug){  pjax_console('state_destination ' + state_destination); }
			if(pjax_debug){  pjax_console('Last navigated ' + last_navigated_url.split('#')[0]); }

			if(last_navigated_url.split('#')[0].trim() == state_destination.trim()){
				/* If we have a hash location - let's restore it */
				scroll_to_hash();
				pjax_console("Same page popstate");
				return;
			}

		}
	}

	/* Cached content retrieval */
	if(pjax_cache[state_destination]){
		if(pjax_debug){ pjax_console('pjax popstate cache'); }
		e.preventDefault();

		restore_pop_state_content(state_destination, pjax_cache[state_destination]);

		return;
	}

	/* Fetch fresh content */
	$.ajax({
		url: state_destination + "?v_ajax",
		context: document.body
	}).done(function(content) {
		e.preventDefault();

		restore_pop_state_content(state_destination, content);
		pjax_cache[state_destination] = content;

		if(pjax_debug){  pjax_console('pop_state ajax ' + state_destination); }
	});

});