<?php
	
	require_once 'bootstrap.php';
	require_once 'config.php';
		
	$bootstrap_config['local_js'][]  = 'js/display.js';
	$bootstrap_config['local_css'][]  = 'css/display.css';
		
	bootstrap_head("Apotheken-Notdienst");
		
?>
<div id="headline" class="container"></div>
<main id="mainbox" role="main" class="container">
</main>
<footer class="container">  
</footer>
<?php
	bootstrap_foot();
?>