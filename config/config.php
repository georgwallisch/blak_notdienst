<?php

$config = require __DIR__.'/defaults.php';

$local = __DIR__.'/config.local.php';

if (file_exists($local)) {
    $config = array_replace_recursive(
        $config,
        require $local
    );
}

return $config;

?>