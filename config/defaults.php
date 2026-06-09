<?php

return [
	'logging' => [
		'file' => __DIR__.'/../log/notdienst.log',
		'enabled' => true,
		'level'   => LOG_INFO
	],	

    'cache' => [
        'directory' => __DIR__.'/../cache',
        'max_age'   => 3600,
        'file_prefix' => 'notdienst_',
        'file_suffix' => '.xml'
    ],

    'overlay' => [
        'duration' => 30,
        'period'   => 270
    ],

    'debug' => false,
    
    'curl' => [
        'connecttimeout' => 5,
        'timeout'  => 10
    ],

    'api_urls' => []
];

?>