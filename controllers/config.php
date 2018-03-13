<?php

include_once "../models/config.php";

class Config
{
    private $config_model;
    function __construct(){
        $this->config_model = new ConfigModel();
    }
    public function fetch(){
        $this->config_model->fetch();
        return $this->config_model->result;
    }
}

class Team{
    private $team_model;
    function __construct(){
        $this->team_model = new TeamsModel();
    }
    public function add($team){
        $this->team_model->add($team);
        return $this->team_model->result;
    }
    public function delete($team){
        $this->team_model->delete($team);
        return $this->team_model->result;
    }
    public function modify($team){
        $this->team_model->modify($team);
        return $this->team_model->result;
    }
}

class Operator{
    private $operator_model;
    function __construct(){
        $this->operator_model = new OperatorModel();
    }
    public function add($operator){
        $this->operator_model->add($operator);
        return $this->operator_model->result;
    }
    public function delete($operator){
        $this->operator_model->delete($operator);
        return $this->operator_model->result;
    }
    public function modify($operator){
        $this->operator_model->modify($operator);
        return $this->operator_model->result;
    }
}

class ExecutionMachine{
    private $exec_station_model;
    function __construct(){
        $this->exec_station_model = new ExecMachinesModel();
    }
    public function add($machine){
        $this->exec_station_model->add($machine);
        return $this->exec_station_model->result;
    }
    public function delete($machine){
        $this->exec_station_model->delete($machine);
        return $this->exec_station_model->result;
    }
    public function modify($machine){
        $this->exec_station_model->modify($machine);
        return $this->exec_station_model->result;
    }
}

class BuildStation{
    private $build_station_model;
    function __construct(){
        $this->build_station_model = new BuildStationsModel();
    }
    public function add($machine){
        $this->build_station_model->add($machine);
        return $this->build_station_model->result;
    }
    public function delete($machine){
        $this->build_station_model->delete($machine);
        return $this->build_station_model->result;
    }
    public function modify($machine){
        $this->build_station_model->modify($machine);
        return $this->build_station_model->result;
    }
}

class MAFStation{
    private $maf_station_model;
    function __construct(){
        $this->maf_station_model = new MAFStationModel();
    }
    public function add($machine){
        $this->maf_station_model->add($machine);
        return $this->maf_station_model->result;
    }
    public function delete($machine){
        $this->maf_station_model->delete($machine);
        return $this->maf_station_model->result;
    }
    public function modify($machine){
        $this->maf_station_model->modify($machine);
        return $this->maf_station_model->result;
    }
}