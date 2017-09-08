<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 7. 9. 2017
 * Time: 17:04
 */
include_once "../../controllers/config.php";
$controller = new BuildStation();
$result = $controller->delete($_POST);
header('Content-Type: application/json');
echo json_encode($result);