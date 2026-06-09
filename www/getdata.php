<?php

$config = require __DIR__.'/../config/config.php';

function _log($msg, $level = 0) {
    
	global $config;
	
	if(!$config['logging']['enabled'] or $level > $config['logging']['level']) return false;

    error_log(
        date('[Y-m-d H:i:s] ') . $msg . PHP_EOL,
        3,
        $config['logging']['file']
    );
}

function getCacheFile($id) {
	global $config;
	$cache_params = $config['cache'];
	
	return $cache_params['directory'].'/'.$cache_params['file_prefix'].$id.$cache_params['file_suffix'];
}

function getCache($id) {
	global $config;
	$cache_params = $config['cache'];
	
	$cache_file = getCacheFile($id);
	
	$data = false;
	
	if(file_exists($cache_file)) {
		$age = time() - filemtime($cache_file);
		if($age < $cache_params['max_age']) {
    		_log(
				sprintf(
					'Cache-Treffer %s (Alter %d Sekunden)',
					$cache_file,
					$age
				),
				LOG_INFO
			);
			$data = file_get_contents($cache_file);
		} else {
		    _log(
				sprintf(
					'Cache %s ist zu alt (%d Sekunden)',
					$cache_file,
					$age
				),
				LOG_INFO
			);
				
			$data = updateCache($id);
			if($data === false) {
				_log(
					sprintf(
						'Nutze veralteten Cache %s, weil Aktualisierung fehlgeschlagen ist',
						$cache_file
					),
					LOG_WARN
				);
				$data = file_get_contents($cache_file);
			}			
		}
	} else {
		_log(
			sprintf(
				'Cache %s existiert (noch) nicht',
				$cache_file
			),
			LOG_INFO
		);
		$data = updateCache($id);
	}
    
	return $data;
}

function updateCache($id) {
	global $config;
	$api_urls = $config['api_urls'];
	
	if(array_key_exists($id, $api_urls)) {
		$url = $api_urls[$id];
	} else {
		_log('Unbekannte ApoID: '.$id, LOG_WARN);
		return null;
	}
	
	$cache_file = getCacheFile($id);
    $data = downloadData($url);
    
    if($data !== false) {		
		if(file_put_contents($cache_file, $data) === false) {
			_log('Konnte Cache-Datei '.$cache_file.' nicht schreiben!', LOG_ERR);
		} else {
			chmod($cache_file, 0664);
			_log('Cache aktualisiert '.$cache_file, LOG_INFO);
		}
	} else {
		_log('Konnte keine Daten von '.$url.' lesen!', LOG_WARN);
	}
	
	return $data;
}

function downloadData($url) {
	
	global $config;	
	$params = $config['curl'];

	$ch = curl_init();
    
	curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $params['connecttimeout'] ?? 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, $params['timeout'] ?? 10);
    
    $output = curl_exec($ch);
    
    $http_code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    
    if($output === false) {
		_log(
			sprintf(
				'[getdata] cURL-Fehler für %s: %s',
				$url,
				curl_error($ch)
			),
			LOG_ERR
		);
	} elseif ($http_code != 200) {
		_log(
			sprintf(
				'[getdata] HTTP %d von %s',
				$http_code,
				$url
			),
			LOG_ERR
		);
		$output = false;
	}
	
    curl_close($ch);      

    return $output;
}

/* MAIN */

if(PHP_SAPI === 'cli') {
	foreach($config['api_urls'] as $id => $url) {
		echo 'Aktualisiere Cache für '.$id.': '; 
    	echo updateCache($id) === false ? 'Fehler!' : 'OK';
    	echo "\n";
    }
    exit;
}

if(isset($_GET['id'])) {
	$apo_id = trim($_GET['id']);	
	
	$data = getCache($apo_id);
	
	if($data === null) {
		header('Content-Type: text/plain');
		http_response_code(400);
		echo 'Unbekannte ApoID: '.$apo_id;
		exit;
	} elseif($data === false) {
	    header('Content-Type: text/plain');
	    http_response_code(503);
	    echo 'Keine Notdienstdaten verfügbar!';
	} else {
	    header('Content-Type: application/xml');
	    echo $data;
	}
 	
} else {
	
    header('Content-Type: text/plain');
   	http_response_code(400);
    echo "Keine ApoID vorhanden!";
    exit;
}

?>