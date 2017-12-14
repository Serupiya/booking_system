<?php

include_once "../controllers/config.php";
$controller = new Config();
$result = $controller->fetch();
header('Content-Type: application/json');
echo json_encode($result);