<?php

include_once "../controllers/global_event.php";
$event = new GlobalEvent();
$result = $event->delete($_POST);
header('Content-Type: application/json');
echo json_encode($result);