<?php


include_once "../controllers/project.php";
$project = new Project();
$result = $project->add($_POST);
header('Content-Type: application/json');
echo json_encode($result);