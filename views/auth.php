<?php


include_once "../controllers/auth.php";
$auth = new Authorization();
$result = $auth->get_rights($_POST);
header('Content-Type: application/json');
echo json_encode($result);