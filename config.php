<?php
	error_reporting(E_ALL & ~E_NOTICE);

	$title = 'Notdienst API';
	
	$bootstrap_config['local_css'][] = 'css/notdienst.css';
	$bootstrap_config['local_js'][]  = 'js/resources.js';
	$bootstrap_config['local_js'][]  = 'js/np_xmlapi.js';
	$bootstrap_config['local_js'][]  = 'js/gwjslib.js';
	$bootstrap_config['local_js'][]  = 'js/feiertage.js';
	$bootstrap_config_defaults['global_js']['momentJS'] = 'moment_js';
	/*
	$bootstrap_config['dev_mode'] = true;
	$bootstrap_config['verbose'] = true;
	*/
	
?>
