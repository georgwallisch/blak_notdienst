<?php
	
	require_once 'bootstrap.php';
	require_once 'config.php';
	require_once '/var/www/html/lib/ipnetze-data.php';
	
	$bootstrap_config['local_js'][]  = 'js/display.js';
	$bootstrap_config['local_css'][]  = 'css/display.css';

	
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
		
	bootstrap_head("Apotheken-Notdienst");
		
?>
<div id="headline" class="container"></div>
<main id="mainbox" role="main" class="container">
</main>
<?php
	bootstrap_foot();
?>