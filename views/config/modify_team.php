<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 24. 9. 2017
 * Time: 15:27
 */

include_once "../../controllers/config.php";
$controller = new Team();
$result = $controller->modify($_POST);
header('Content-Type: application/json');
echo json_encode($result);