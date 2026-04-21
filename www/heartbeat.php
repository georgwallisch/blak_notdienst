<?php
	header('Content-Type: text/plain');
	$h = '/run/notdienst/heartbeat';
	$t = time();
	
	if (file_put_contents($h, $t) === false) {
		http_response_code(500);
		echo "ERROR writing $h";
		exit(1);
	}
	
	echo "Alive since $t";
?>