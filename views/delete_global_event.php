<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 7. 9. 2017
 * Time: 11:52
 */

include_once "../controllers/global_event.php";
$event = new GlobalEvent();
$result = $event->delete($_POST);
header('Content-Type: application/json');
echo json_encode($result);