<?php

include_once "../models/project.php";


class Project
{
    private $project_model;
    function __construct(){
        $this->project_model = new ProjectModel();
    }
    function modify($project){
        $this->project_model->modify($project);
        return $this->project_model->result;
    }
    function add($project){
        $this->project_model->add($project);
        return $this->project_model->result;
    }
    function delete($project){
        //the project only contains it's name here
        $this->project_model->delete($project);
        return $this->project_model->result;
    }
    function fetch_all(){
        $this->project_model->fetch_all();
        return $this->project_model->result;
    }
}
