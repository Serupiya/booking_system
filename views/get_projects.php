<?php

include_once "../controllers/project.php";
$project = new Project();
$result = $project->fetch_all();
header('Content-Type: application/json');
echo json_encode($result);