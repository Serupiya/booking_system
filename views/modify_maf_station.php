<?php

include_once "../controllers/config.php";
$controller = new MAFStation();
$result = $controller->modify($_POST);
header('Content-Type: application/json');
echo json_encode($result);