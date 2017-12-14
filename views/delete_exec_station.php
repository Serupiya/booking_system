<?php

include_once "../controllers/config.php";
$controller = new ExecutionMachine();
$result = $controller->delete($_POST);
header('Content-Type: application/json');
echo json_encode($result);