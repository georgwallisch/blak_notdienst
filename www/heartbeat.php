<?php
	require_once '../lib/heartbeat_lib.php';
	send_response(write_heartbeat());
	exit(0);
?>