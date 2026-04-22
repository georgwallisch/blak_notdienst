<?php
	
const HEARTBEAT_DEFAULT_FILE = '/run/notdienst/heartbeat';

function write_heartbeat(?string $heartbeat_file = null): int|false {
	
    $heartbeat_file ??= HEARTBEAT_DEFAULT_FILE;

    $dir = dirname($heartbeat_file);

    if (!is_dir($dir) || !is_writable($dir)) {
        return false;
    }
	
	$t = time();
	
	return file_put_contents($heartbeat_file, $t, LOCK_EX) === false ? false : $t;
}

function send_response(int|false $heartbeat, ?string $heartbeat_file = null): int|false {

    $heartbeat_file ??= HEARTBEAT_DEFAULT_FILE;
		
	if (!headers_sent()) {
		header('Content-Type: text/plain');
	}
	
	if($heartbeat === false) {
		http_response_code(500);
		$error = error_get_last();
		echo "ERROR writing $heartbeat_file: " . ($error['message'] ?? 'unknown');
		return false;
	}
	
	echo "Alive since $heartbeat";

	return $heartbeat;
}

?>