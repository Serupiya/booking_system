<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 7. 9. 2017
 * Time: 16:47
 */
include_once "../../controllers/config.php";
$controller = new Config();
$result = $controller->fetch();
header('Content-Type: application/json');
echo json_encode($result);