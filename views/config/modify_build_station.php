<?php


include_once "../../controllers/config.php";
$controller = new BuildStation();
$result = $controller->modify($_POST);
header('Content-Type: application/json');
echo json_encode($result);