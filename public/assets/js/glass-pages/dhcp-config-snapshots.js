function view_snapshot(snapshot) {
	$.post( "/dhcp_config_snapshot_view", "snapshot=" + encodeURIComponent(snapshot), function( data ) {

		$('#snapshot_grid').fadeOut(100).fadeIn(100);
		$('#snapshot_name').html("Snapshot '" + snapshot + "'");
		$('#snapshot_body').html('<div id="snapshot" style="width:100%; height:800px; color: #95cd24">' + data + '</div>');

        $('html, body').animate({
            scrollTop: $("#snapshot_grid").offset().top
        }, 500);

		config_snapshot = ace.edit("snapshot");
		config_snapshot.setTheme("ace/theme/terminal");
		config_snapshot.$blockScrolling = Infinity;
	});
}