<?php
/*	lak-bayern.notdienst-portal.de API HACK 	*
*	by gw (it@schug-gruppe.de)			*
*	25.06.2024					*/

	$baseurl = 'https://lak-bayern.notdienst-portal.de/blakportal/';
	$cookiefile = '/tmp/blakportal-cookies.txt';

	$debugmode = get_value('debug', false);
		
	if($debugmode) {
		error_reporting(E_ALL & ~E_NOTICE);
		ini_set("display_errors", 1);
	}
	
	function get_value($name, $default = null, $isnot = null) {
		if(!array_key_exists($name, $_REQUEST) or $_REQUEST[$name] == $isnot) {
			return $default;
		}
		
		return $_REQUEST[$name];	
	}

	function np_get_curl($url, $post = null) {
		global $cookiefile;
		$res = array();
		$res['url'] = $url;
		$curl_handler = curl_init() ;
		curl_setopt($curl_handler,CURLOPT_URL, $url);
		curl_setopt($curl_handler,CURLOPT_COOKIEJAR, $cookiefile);
		curl_setopt($curl_handler,CURLOPT_COOKIEFILE, $cookiefile);
	
		if(is_array($post)) {
			$res['post_string'] = http_build_query($post);
			curl_setopt($curl_handler,CURLOPT_POST, true);
			curl_setopt($curl_handler,CURLOPT_POSTFIELDS, $res['post_string']);
		}
			
		curl_setopt($curl_handler, CURLOPT_RETURNTRANSFER, 1) ;
		
		if(($res['errno'] = curl_errno($curl_handler)) > 0) {
			$res['error'] = curl_error($curl_handler);
		}
		$res['data'] = curl_exec($curl_handler);
		curl_close($curl_handler);
		return ($res) ;
	}

	/* main code starts here */

	
	ob_start();
	
	$action = get_value('action');
	$r = array();
	
	if(!file_exists($cookiefile)) {
		$fh = fopen($cookiefile, 'w');
		if($fh !== false) {
			fwrite($fh, '');
			fclose($fh);
		} else {
			$r['errno'] = 999;
			$r['error'] = "Cookie file {$cookiefile} does not exist and can not create it!";
		}
	} elseif(!is_writeable($cookiefile)) {
		$r['errno'] = 999;
		$r['error'] = "Cookie file {$cookiefile} does exist but is not writeable!";
	}
			
	if($r['errno'] < 1 and !is_null($action) and strlen($action) > 0) {
		//$r = np_get_curl($baseurl);
//		if($r['errno'] == 0) {
			$url = $baseurl.$action;
		
			$params = get_value('jsondata');
			/*
			if(is_string($params)) {
				$params = json_decode($data);
			}
			*/
			if(!is_array($params)) {
				$params = array();
				foreach($_REQUEST as $k => $v) {
					if($k == 'action' or $k == 'debug') continue;
					$params[$k] = $v;
				}
			}
			
			if(count($params) > 0) {
				$r = np_get_curl($url , $params);
				$r['params'] = $params;
			} else {
				$r['errno'] = 999;
				$r['error'] = "No params given!";
			}
//		}
	} else {
		$r['errno'] = 999;
		$r['error'] = "No action set";
	}
	
	$c = ob_get_contents();
		
	ob_end_clean();
		
	if($debugmode) {
					
		header("Content-type: text/plain; charset=utf-8");
		echo "-- DEBUG MODE --\n\n";
		
		echo print_r($_REQUEST);
		echo "\n\n-- Cookie file {$cookiefile} --\n\n";
		echo file_get_contents($cookiefile);
		echo "\n\n-- cURL Return --\n\n";
		echo print_r($r);
		
		if(strlen($c) > 0) {
			echo "\n\n-- OB Content --\n\n";
			echo print_r($c);
		}
	

	} else {
		/* header("Content-type: application/json; charset=utf-8"); */
		header("Content-type: text/html; charset=utf-8");
		if($r['errno'] != 0) {
			echo "ERROR (".$r['errno']."): ".$r['error']."\n----";
		} else {
			echo $r['data'];
		}
	}		
		
	
?>
