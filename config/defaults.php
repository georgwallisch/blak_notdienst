<?php

return [

    'cache' => [
        'directory' => __DIR__.'/../cache',
        'max_age'   => 3600
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