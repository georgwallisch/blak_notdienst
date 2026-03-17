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
		
	if(array_key_exists('id', $_REQUEST) and ($id = strtoupper($_REQUEST['id'])) != '') {
		$bootstrap_config['inline_js_vars']['apo_id'] = $id;
	} 	
?>
