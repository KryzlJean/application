<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "success" => true,
    "message" => "Server is working!",
    "timestamp" => date('Y-m-d H:i:s'),
    "php_version" => PHP_VERSION
]);
?>
