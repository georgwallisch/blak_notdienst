<?php
	error_reporting(E_ALL & ~E_NOTICE);

	$title = 'Notdienst API';
	
	$bootstrap_config['global_js']['momentJS'] = 'moment_js';
/*
	$bootstrap_config['global_js']['jQuery UI'] = false;
	$bootstrap_config['global_js']['jquery-ui_js'] = false;
	$bootstrap_config['global_css']['jquery-ui_css'] = false;
*/
	$bootstrap_config['local_js'][]  = 'js/gwjslib.js';
	$bootstrap_config['local_js'][]  = 'js/np_xmlapi.js';
	$bootstrap_config['local_js'][]  = 'js/feiertage.js';
	$bootstrap_config['local_js'][]  = 'js/resources.js';
		
	
	/*
	$bootstrap_config['dev_mode'] = true;
	$bootstrap_config['verbose'] = true;
	*/
	
	require_once '/var/www/html/lib/ipnetze-data.php';
	
	$netz_id = false;
	$netz_data = false;
	
	if(array_key_exists('id', $_REQUEST) and ($id = $_REQUEST['id']) != '') {		
		if(array_key_exists($id, $ipdata)) {
			$netz_id = $id;
			$netz_data = $ipdata[$id];
		}
	} 	
	
	if(!$netz_id) {
		$mask = ip2long('255.255.255.0');
		$ip = ip2long($_SERVER['REMOTE_ADDR']);
		$netz = $ip & $mask;
			
		foreach($ipdata as $id => $data) {
			if(ip2long($data['Netz']) == $netz) {
				$netz_id = $id;
				$netz_data = $data;
				break;
			} 
		}
	}
	
	if($netz_id) {
	
		$bootstrap_config['inline_js_vars']['apo_id'] = $netz_id;
		$bootstrap_config['inline_js_vars']['apo_shortname'] = $netz_data['shortname'];
		$bootstrap_config['inline_js_vars']['apo_name'] = $netz_data['name'];
		$bootstrap_config['inline_js_vars']['apo_ort'] = $netz_data['ort'];
	}
?>
