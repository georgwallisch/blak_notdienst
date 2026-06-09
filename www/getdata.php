<?php

ob_start();

$config = require '../config/config.php';
$api_urls = $config['api_urls'];
$cache_age = $config['cache']['max_age'];
$cache_dir = $config['cache']['directory'];
$curl_params = $config['curl'];


function downloadData($url, $params) {

	$ch = curl_init();
    
	curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $params['connecttimeout'] ?? 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, $params['timeout'] ?? 10);
    
    $output = curl_exec($ch);
    
    $http_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    
    if($output === false) {
		error_log(
			sprintf(
				'[getdata] cURL-Fehler für %s: %s',
				$url,
				curl_error($ch)
			)
		);
	} elseif ($http_code != 200) {
		error_log(
			sprintf(
				'[getdata] HTTP %d von %s',
				$http_code,
				$url
			)
		);
	}
	
    curl_close($ch);      

    return $output;
}

if(array_key_exists('id', $_GET)) {
	$apo_id = trim($_GET['id']);	
	
	if(array_key_exists($apo_id, $api_urls)) {
		$apo_url = $api_urls[$apo_id];
	} else {
		ob_end_clean();
		header('Content-Type: text/plain');
		http_response_code(400);
		echo "Unbekannte ApoID: '$apo_id'";
		exit;
	} 	
} else {
	ob_end_clean();
    header('Content-Type: text/plain');
	http_response_code(400);
    echo "Keine ApoID vorhanden!";
    exit;
}

$cache_file = $cache_dir.'/notdienst_'.$apo_id.'.xml';

if(file_exists($cache_file)) {

    $age = time() - filemtime($cache_file);

    if ($age < $cache_age) {
    	ob_end_clean();
    	header('Content-Type: application/xml');
    	readfile($cache_file);
        exit;
    }
}

$new_data = downloadData($apo_url, $curl_params);

if ($new_data !== false) {

	if (file_put_contents($cache_file, $new_data) === false) {
		error_log(
			sprintf(
				'[getdata] Konnte Cache-Datei %s nicht schreiben',
				$cache_file
			)
		);
	} else {
		error_log(
			sprintf(
				'[getdata] Cache aktualisiert %s',
				$cache_file
			)
		);
	}
   	
	ob_end_clean();
    header('Content-Type: application/xml');
    echo $new_data;

} elseif (file_exists($cache_file)) {

	error_log(
        sprintf(
            '[getdata] Verwende alten Cache %s (Alter: %d Sekunden)',
            $cache_file,
            time() - filemtime($cache_file)
        )
    );
	
  	ob_end_clean();
    header('Content-Type: application/xml');
    readfile($cache_file);

} else {
	ob_end_clean();
    header('Content-Type: text/plain');
    http_response_code(503);
    echo "Keine Notdienstdaten verfügbar";
}

?>