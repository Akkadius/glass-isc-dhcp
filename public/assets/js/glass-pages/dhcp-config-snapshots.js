function view_snapshot(snapshot) {
	$.post( "/dhcp_config_snapshot_view", "snapshot=" + encodeURIComponent(snapshot), function( data ) {

		$('#modal-title').html("Snapshot '" + snapshot + "'");
		$('#modal-body').html('<div id="snapshot" style="width:100%; height:800px; color: #95cd24">' + data + '</div>');

		config_snapshot = ace.edit("snapshot");
		config_snapshot.setTheme("ace/theme/terminal");
		config_snapshot.$blockScrolling = Infinity;

		$('#mdModal').modal('show');
	});
}