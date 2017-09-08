<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 3. 9. 2017
 * Time: 22:48
 */

include_once "../controllers/project.php";
$project = new Project();
$result = $project->add($_POST);
header('Content-Type: application/json');
echo json_encode($result);