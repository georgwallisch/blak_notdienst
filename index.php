<?php

	header('Location: display.php');
	exit(0);
	
	require_once 'bootstrap.php';
	require_once 'config.php';
	
	$bootstrap_config['local_js'][]  = 'js/notdienst.js';
	
	bootstrap_head($title);
	
?>

	<nav id="main_nav" class="navbar navbar-expand-md navbar-light bg-light">
		<a class="navbar-brand" href="#"><?php echo $title; ?></a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main_navbarCollapse" aria-controls="main_navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="main_navbarCollapse">
			<ul class="navbar-nav mr-auto">		  
			</ul>
		</div>
	</nav>
	

<main id="mainbox" role="main" class="container">
</main>


<?php
	bootstrap_foot();
?>