<?php

include_once "base_model.php";

class ConfigModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    function fetch(){
        if ($this->error) return;

        $this->result = Array(
            "exec_stations" => Array(),
            "build_stations" => Array(),
            "teams" => Array(),
            "ate_operators" => Array(),
            "maf_stations" => Array());

        $query_result = $this->db->query("SELECT * FROM exec_stations ORDER BY name;");
        if ($this->assert_error("Failed to fetch config/exec_stations")) return;

        while($result = $query_result->fetch_assoc()) {
            array_push($this->result["exec_stations"], $result);
        }

        $query_result = $this->db->query("SELECT * FROM build_stations ORDER BY name;");
        if ($this->assert_error("Failed to fetch config/build_stations")) return;

        while($result = $query_result->fetch_assoc()) {
            array_push($this->result["build_stations"], $result);
        }

        $query_result = $this->db->query("SELECT * FROM teams ORDER BY name;");
        if ($this->assert_error("Failed to fetch config/teams")) return;

        while($result = $query_result->fetch_assoc()) {
            array_push($this->result["teams"], $result);
        }

        $query_result = $this->db->query("SELECT * FROM ate_operators ORDER BY name;");
        if ($this->assert_error("Failed to fetch config/ate_operators")) return;

        while($result = $query_result->fetch_assoc()) {
            array_push($this->result["ate_operators"], $result);
        }

        $query_result = $this->db->query("SELECT * FROM maf_stations ORDER BY name;");
        if ($this->assert_error("Failed to fetch config/maf_stations")) return;

        while($result = $query_result->fetch_assoc()) {
            array_push($this->result["maf_stations"], $result);
        }
    }
}

class BuildStationsModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    public function add($build_station){
        if ($this->error) return;

        $this->escape_array($build_station);
        $query = sprintf("INSERT INTO build_stations (name, link) VALUES ('%s', '%s');",
            $build_station["name"],
            $build_station["link"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add build station")) return;
        $build_station["id"] = $this->db->insert_id;
        $this->result = $build_station;
    }
    public function delete($build_station){
        if ($this->error) return;

        $this->escape_array($build_station);
        $query = sprintf("DELETE FROM build_stations WHERE id = %d", $build_station["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete build station")) return;
        $this->result = $build_station;
    }
    public function modify($build_station){
        if ($this->error) return;

        $this->escape_array($build_station);

        $query = sprintf("UPDATE build_stations SET name = '%s', link = '%s' WHERE id = %d;",
            $build_station["name"],
            $build_station["link"],
            $build_station["id"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to modify build station")) return;
        $this->result = $build_station;
    }

}
class ExecMachinesModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    public function add($exec_machine){
        if ($this->error) return;

        $this->escape_array($exec_machine);
        $query = sprintf("INSERT INTO exec_stations (name, location, framework) VALUES ('%s', '%s', '%s');",
            $exec_machine["name"],
            $exec_machine["location"],
            $exec_machine["framework"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add execution machine")) return;
        $exec_machine["id"] = $this->db->insert_id;
        $this->result = $exec_machine;
    }
    public function delete($exec_machine){
        if ($this->error) return;

        $this->escape_array($exec_machine);
        $query = sprintf("DELETE FROM exec_stations WHERE id = %d", $exec_machine["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete execution machine")) return;
        $this->result = $exec_machine;
    }
    public function modify($exec_machine){
        if ($this->error) return;

        $this->escape_array($exec_machine);

        $query = sprintf("UPDATE exec_stations SET name = '%s', location = '%s', framework = '%s' WHERE id = %d;",
            $exec_machine["name"],
            $exec_machine["location"],
            $exec_machine["framework"],
            $exec_machine["id"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to modify execution machine")) return;
        $this->result = $exec_machine;
    }
}
class TeamsModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    public function add($team){
        if ($this->error) return;

        $this->escape_array($team);
        $query = sprintf("INSERT INTO teams (name) VALUES ('%s');",
            $team["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add team")) return;
        $team["id"] = $this->db->insert_id;
        $this->result = $team;
    }
    public function delete($team){
        if ($this->error) return;

        $this->escape_array($team);
        $query = sprintf("DELETE FROM teams WHERE id = %d", $team["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete team")) return;
        $this->result = $team;
    }

    public function modify($team){
        if ($this->error) return;

        $this->escape_array($team);

        $query = sprintf("UPDATE teams SET name = '%s' WHERE id = %d;",
            $team["name"],
            $team["id"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to modify team")) return;
        $this->result = $team;
    }

}
class OperatorModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    public function add($operator){
        if ($this->error) return;

        $this->escape_array($operator);
        $query = sprintf("INSERT INTO ate_operators (name) VALUES ('%s');",
            $operator["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add operator")) return;
        $operator["id"] = $this->db->insert_id;
        $this->result = $operator;
    }
    public function delete($operator){
        if ($this->error) return;

        $this->escape_array($operator);
        $query = sprintf("DELETE FROM ate_operators WHERE id = %d", $operator["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete operator")) return;
        $this->result = $operator;
    }
    public function modify($operator){
        if ($this->error) return;

        $this->escape_array($operator);

        $query = sprintf("UPDATE ate_operators SET name = '%s' WHERE id = %d;",
            $operator["name"],
            $operator["id"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to modify operator")) return;
        $this->result = $operator;
    }
}

class MAFStationModel extends BaseModel{
    function __construct()
    {
        parent::__construct();
    }
    public function add($maf){
        if ($this->error) return;

        $this->escape_array($maf);
        $query = sprintf("INSERT INTO maf_stations (name, ip, status, comment) VALUES ('%s', '%s', '%s', '%s');",
            $maf["name"], $maf["ip"], $maf["status"], $maf["comment"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add MAF")) return;
        $maf["id"] = $this->db->insert_id;
        $this->result = $maf;
    }
    public function delete($maf){
        if ($this->error) return;

        $this->escape_array($maf);
        $query = sprintf("DELETE FROM maf_stations WHERE id = %d", $maf["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete MAF")) return;
        $this->result = $maf;
    }
    public function modify($maf){
        if ($this->error) return;

        $this->escape_array($maf);

        $query = sprintf("UPDATE maf_stations SET name = '%s', ip = '%s', status = '%s', comment = '%s' WHERE id = %d;",
            $maf["name"],
            $maf["ip"],
            $maf["status"],
            $maf["comment"],
            $maf["id"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to modify MAF")) return;
        $this->result = $maf;
    }
}