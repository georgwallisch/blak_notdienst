<?php

ob_start();

$config = require '../config/config.php';
$api_urls = $config['api_urls'];
$cache_age = $config['cache']['max_age'];
$cache_dir = $config['cache']['directory'];

function downloadData($url) {

	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    curl_close($ch);      

    return $output;
}

if(array_key_exists('id', $_REQUEST)) {
	$apo_id = trim($_REQUEST['id']);	
	
	if(array_key_exists($apo_id, $api_urls)) {
		$apo_url = $api_urls[$apo_id];
	} else {
		ob_end_clean();
		header('Content-Type: text/plain');
		http_response_code(503);
		echo "Keine ApoID '$apo_id' unbekannt!";
		exit;
	} 	
} else {
	ob_end_clean();
    header('Content-Type: text/plain');
	http_response_code(503);
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

$new_data = downloadData($apo_url);

if ($new_data !== false) {

    file_put_contents($cache_file, $new_data);
   	ob_end_clean();
    header('Content-Type: application/xml');
    echo $new_data;

} elseif (file_exists($cache_file)) {

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