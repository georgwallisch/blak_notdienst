<?php
/********************************
* Bootstrap Include Functions	*
* v 4.x.x						*
*********************************/ 

if(!isset($bootstrap_config) or !is_array($bootstrap_config)) {
	$bootstrap_config = array();
}

$bootstrap_errors = array();
$bootstrap_verbose = array();
$bootstrap_config_defaults = array();

$bootstrap_config_defaults['resource_server'] = 'https://intern.apotheke-schug.de';
$bootstrap_config_defaults['version'] = '4.6.2';
$bootstrap_config_defaults['css_integrity'] = 'sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N';
$bootstrap_config_defaults['js_integrity'] = 'sha384-Fy6S3B9q64WdZWQUiU+q4/2Lc9npb8tCaSX9FK7E8HnRr0Jz8D6OP9dO5Vg3Q9ct';
$bootstrap_config_defaults['path'] =  '/bootstrap/';
$bootstrap_config_defaults['js_path'] = $bootstrap_config_defaults['css_path'] = '/js/';


$bootstrap_config_defaults['jquery_js_version'] = '3.7.1';
$bootstrap_config_defaults['jquery_js_dir'] = 'jquery-';
$bootstrap_config_defaults['jquery_js_file'] = '.min.js';
$bootstrap_config_defaults['jquery_js_integrity'] = 'sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs';
$bootstrap_config_defaults['jquery-ui_js_dir'] = $bootstrap_config_defaults['jquery-ui_css_dir'] = 'jquery-ui-1.13.0.custom/';
$bootstrap_config_defaults['jquery-ui_css_integrity'] = 'sha384-8mv+EdwtnOCaUtnx36+KcuDVM0FRQ8cTdA6kqCZXbJWr1i2FC3x31Bhl2MG1gZdE';
$bootstrap_config_defaults['jquery-ui_js_integrity'] = 'sha384-wjHrTJpOKGCAKZrtQ91chBNFhgX2FABFT5uqMIyby8Ms1BxWKIU6T25KvWURp1s3';
$bootstrap_config_defaults['jquery-ui-i18n_js_dir'] = 'jquery-ui-i18n/';
$bootstrap_config_defaults['jquery-ui-i18n_js_file'] = 'datepicker-de.js';
$bootstrap_config_defaults['jquery-ui-i18n_js_integrity'] = 'sha384-NPnUv15Ub9lg3oIQmHmHanS5jJfuY3N+gKWRixQmbbQELD+uB47cn5F55VaRSs8k';
$bootstrap_config_defaults['moment_js_version'] = 'latest/';
$bootstrap_config_defaults['moment_js_dir'] = 'momentjs/';
$bootstrap_config_defaults['moment_js_file'] = 'moment-with-locales.min.js';
//$bootstrap_config_defaults['moment_js_integrity'] = 'sha384-IFyOtsSJQkqd1kMlhelCNzXIOub/YQewnLE43aaVvkbMDQMBbg7WApLMjn9yuW9M';

$bootstrap_config_defaults['er'] = 0;
$bootstrap_config_defaults['er_dev'] = E_ALL & ~E_NOTICE;
$bootstrap_config_defaults['dev_mode'] = false;
$bootstrap_config_defaults['verbose'] = false;
$bootstrap_config_defaults['debug_mode'] = false;

$bootstrap_config_defaults['global_css'] = array('jquery-ui_css');
$bootstrap_config_defaults['global_js'] = array('jQuery (necessary for Bootstrap\'s JavaScript plugins)' => 'jquery_js', 'Latest compiled and minified JavaScript' => 'js','jQuery UI' => 'jquery-ui_js', 'jQuery Datepicker' => 'jquery-ui-i18n_js');
$bootstrap_config_defaults['local_css'] = array();
$bootstrap_config_defaults['local_js'] = array();
$bootstrap_config_defaults['inline_js_vars'] = array('debug_mode' => false);

if(!headers_sent()) {
	header('Access-Control-Allow-Origin: *');
} else {
	$bootstrap_errors[] = 'Headers already sent';
}

$bootstrap_config['er'] = $bootstrap_config_defaults['er'];
$bootstrap_config['dev_mode'] = $bootstrap_config_defaults['dev_mode'];
$bootstrap_config['verbose'] = $bootstrap_config_defaults['verbose'];
$bootstrap_config['debug_mode'] = $bootstrap_config_defaults['debug_mode'];

if(array_key_exists('dev',$_REQUEST)) {
	$bootstrap_config['dev_mode'] = true;
	$bootstrap_config['er'] = $bootstrap_config_defaults['er_dev'];
}

if(array_key_exists('debug',$_REQUEST)) {
	$bootstrap_config['debug_mode'] = true;
	if(array_key_exists('inline_js_vars', $bootstrap_config) and is_array($bootstrap_config['inline_js_vars'])) {
		$bootstrap_config['inline_js_vars']['debug_mode'] = true;
	} else {
		$bootstrap_config['inline_js_vars'] = array('debug_mode' => true);
	}		
}	

if(array_key_exists('verbose',$_REQUEST)) {
	$bootstrap_config['verbose'] = true;
}
	
error_reporting($bootstrap_config['er']);
ini_set('error_reporting', $bootstrap_config['er']);

function bootstrap_asset($s, $type) {
	global $bootstrap_config, $bootstrap_errors, $bootstrap_verbose;
		
	if(!array_key_exists($s, $bootstrap_config)) {
		$bootstrap_errors[] = strtoupper($type)." definition '".$s."' does not exist!";
		return null;
	} else {
		$bootstrap_verbose[] = "Got ".strtoupper($type)." definition '".$s;
	}
	
	if($type == 'css') {
		$r = '<link rel="stylesheet" href="';
		$e = " />\n";
	} elseif ($type == 'script') {
		$r = '<script src="';
		$e = "></script>\n";
	} else {
		$bootstrap_errors[] = "Asset type '".$type."' is unknown!";
		return null;
	}
	
	$r .= $bootstrap_config['resource_server'].$bootstrap_config[$s].'"';
	if(array_key_exists($s.'_integrity', $bootstrap_config)) {
		$r .= ' integrity="'.$bootstrap_config[$s.'_integrity'].'"';
	}
	$r .= ' crossorigin="anonymous"'.$e;

	return $r;
}

function bootstrap_css($s = 'css') {
	return bootstrap_asset($s, 'css');
}

function bootstrap_js($s) {
	return bootstrap_asset($s, 'script');
}


function bootstrap_config($config = NULL) {
	global $bootstrap_config, $bootstrap_config_defaults, $bootstrap_verbose;
	
	$bootstrap_verbose[] = "Init config with defaults";
	foreach($bootstrap_config_defaults as $k => $v){
		if(!array_key_exists($k, $bootstrap_config)) {
			$bootstrap_config[$k] = $v;
		} elseif(is_array($bootstrap_config[$k]) and is_array($bootstrap_config_defaults[$k])) {
			//$bootstrap_config[$k] = array_merge_recursive($bootstrap_config[$k], $bootstrap_config_defaults[$k]);
			$bootstrap_config[$k] = array_merge($bootstrap_config_defaults[$k], $bootstrap_config[$k]);
		}		
	}
	
	$bootstrap_verbose[] = "Merge given config into global config";
	if(is_array($config)) {
		$bootstrap_config = array_merge_recursive($bootstrap_config, $config);
	}
	
	$bootstrap_verbose[] = "Set depending variables";	
	$bootstrap_config['css'] = $bootstrap_config['path'].$bootstrap_config['version'].'/css/bootstrap.min.css';
	$bootstrap_config['js'] = $bootstrap_config['path'].$bootstrap_config['version'].'/js/bootstrap.bundle.min.js';
	
	$x = array('js','css');
	
	foreach($x as $y) {
		if(is_array($bootstrap_config['global_'.$y]) and count($bootstrap_config['global_'.$y]) > 0) {
			foreach($bootstrap_config['global_'.$y] as $k => $v) {
				if($y == $v) continue;
				if(array_key_exists($v.'_dir', $bootstrap_config)) {
						$bootstrap_config[$v.'_path'] = $bootstrap_config[$y.'_path'].$bootstrap_config[$v.'_dir'];
				}
				if(!array_key_exists($v.'_file', $bootstrap_config)) {
						$bootstrap_config[$v.'_file'] =  str_replace('_'.$y,'.min.'.$y,$v);
				}
				
				$bootstrap_config[$v] = $bootstrap_config[$v.'_path'].$bootstrap_config[$v.'_version'].$bootstrap_config[$v.'_file'];
				
			}
		}
	}
	
/*		
	$bootstrap_config['jquery_js'] = $bootstrap_config['js_path'].'jquery-'.$bootstrap_config['jquery_version'].'.min.js';
	$bootstrap_config['jquery-ui_js'] = $bootstrap_config['jquery-ui_path'].'jquery-ui.min.js';
	$bootstrap_config['jquery-ui-i18n_js'] = $bootstrap_config['js_path'].'jquery-ui-i18n/datepicker-de.js';
	$bootstrap_config['jquery-ui_css'] = $bootstrap_config['jquery-ui_path'].'jquery-ui.min.css';
*/
}

function bootstrap_head($title = '') {
	global $bootstrap_config;
	
	bootstrap_config();
	
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <title><?php echo htmlentities($title); ?></title>

    <!-- Bootstrap -->
    <!-- Latest compiled and minified CSS -->
<?php 
    echo "\t".bootstrap_css();
    echo "\t".bootstrap_css('jquery-ui_css');
 
	if(is_array($bootstrap_config['local_css']) and count($bootstrap_config['local_css']) > 0) {
		echo "\t<!-- Custom styles -->\n";
    	foreach($bootstrap_config['local_css'] as $item) {
    			echo "\t".'<link rel="stylesheet" href="'.$item.'" />'."\n";
    	}
    }
    
    echo "\t</head>\n<body>\n";
}

function bootstrap_foot() {
	global $bootstrap_config, $bootstrap_errors, $bootstrap_verbose;
	
	$s = array();
	
	if(is_array($bootstrap_config['global_js']) and count($bootstrap_config['global_js']) > 0) {
		foreach($bootstrap_config['global_js'] as $k => $v) {
			if(is_string($k)) {
				$s[] = '<!-- '.htmlspecialchars($k).' -->';
			}
			if(is_string($v)) {
				$s[] =  bootstrap_js($v);
			}
		}
	}

	if(is_array($bootstrap_config['local_js']) and count($bootstrap_config['local_js']) > 0) {
		foreach($bootstrap_config['local_js'] as $item) {
			$s[] = '<script src="'.$item.'"></script>';
		}
	}
	
	if(is_array($bootstrap_config['inline_js_vars']) and count($bootstrap_config['inline_js_vars']) > 0) {
		$s[] = '<script type="text/javascript">';
		foreach($bootstrap_config['inline_js_vars'] as $k => $v) {
			if(is_string($v) and $v != 'null' and $v != 'true' and $v != 'false') {
				$v = "'".str_replace("'", "\'",$v)."'";
			} elseif(is_bool($v)) {
				if($v) {
					$v = 'true';
				} else {
					$v = 'false';
				}
			} elseif(is_null($v)) {
				$v = 'null';
			} 
			$s[] = "\tvar ".$k.' = '.$v.';';
		}
		$s[] = '</script>';
	}
	
	if($bootstrap_config['dev_mode'] == true and ($c = count($bootstrap_errors)) > 0) {
		echo '<div id="errors" class="container">'."\n<h2>Errors (".$c.")</h2>\n<ul>\n<li>";
		echo implode("</li>\n<li>", $bootstrap_errors);
		echo "</li>\n</ul>\n</div>\n";
	}
	
	if($bootstrap_config['verbose'] == true and ($c = count($bootstrap_verbose)) > 0) {
		echo '<div id="verbose" class="container">'."\n<h2>Verbose info (".$c.")</h2>\n<ul>\n<li>";
		echo implode("</li>\n<li>", $bootstrap_verbose);
		echo "</li>\n</ul>\n</div>\n";
	}
	
	if($bootstrap_config['dev_mode'] == true) {
		echo '<div id="bootstrap_config_info" class="container">'."\n";
		echo '<h2><a class="btn btn-primary" data-toggle="collapse" href="#bootstrap_config" role="button" aria-expanded="false" aria-controls="bootstrap_config">Bootstrap Config</a></h2>';
		echo '<div class="collapse" id="bootstrap_config">'."\n<tt><pre>\n";
		print_r($bootstrap_config);
		echo "\n</div></pre></tt>\n</div>\n";
	}
	
	echo "\n".implode("\n\t",$s);

	echo "\n</body>\n</html>";
}
?>