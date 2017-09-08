<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 6. 9. 2017
 * Time: 14:03
 */
include_once "../controllers/project.php";
$project = new Project();
$result = $project->modify($_POST);
header('Content-Type: application/json');
echo json_encode($result);