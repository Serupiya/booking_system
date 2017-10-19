<?php

include_once "../controllers/global_event.php";
$event = new GlobalEvent();
$result = $event->add($_POST);
header('Content-Type: application/json');
echo json_encode($result);