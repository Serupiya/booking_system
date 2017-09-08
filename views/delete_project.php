<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 6. 9. 2017
 * Time: 23:08
 */
include_once "../controllers/project.php";
$project = new Project();
$result = $project->delete($_POST);
header('Content-Type: application/json');
echo json_encode($result);