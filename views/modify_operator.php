<?php

include_once "../controllers/config.php";
$controller = new Operator();
$result = $controller->modify($_POST);
header('Content-Type: application/json');
echo json_encode($result);