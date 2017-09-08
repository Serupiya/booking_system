<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 3. 9. 2017
 * Time: 20:45
 */

include_once "base_model.php";

class ProjectModel extends BaseModel{
    function __construct()
    {
        parent::__construct();
    }

    public function delete($project){
        if ($this->error) return;

        $this->escape_array($project);

        $query = sprintf("DELETE FROM booking_system.projects WHERE name = '%s'", $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete project")) return;
        else $this->result = Array("success" => true);

    }

    public function modify($project){
        if ($this->error) return;

        $this->escape_array($project);

        $query = sprintf("UPDATE booking_system.projects SET start_date = '%s', end_date = '%s', ate_operator = '%s', team = '%s',
                          sw_versions = '%s', additional_info = '%s', framework = '%s', setup_milestone = '%s' WHERE name = '%s';",
                            $project["start_date"],
                            $project["end_date"],
                            $project["ate_operator"],
                            $project["team"],
                            $project["sw_versions"],
                            $project["additional_info"],
                            $project["framework"],
                            $project["setup_milestone"],
                            $project["name"]);
        $this->db->query($query);

        $query = sprintf("DELETE FROM booking_system.derivatives WHERE project_name = '%s'",
                           $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old derivatives")) return;

        if (!$this->add_derivatives($project)) return;

        $query = sprintf("DELETE FROM booking_system.links WHERE project_name = '%s'",
                           $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old links")) return;

        if (!$this->add_links($project)) return;

        $query = sprintf("DELETE FROM booking_system.quality_pack_stations WHERE project_name = '%s'",
                          $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old quality pack stations")) return;

        if (!$this->add_quality_packs($project)) return;

        $this->result = $project;
    }


    public function add($project)
    {
        if ($this->error) return;

        $this->escape_array($project);
        $query = sprintf("INSERT INTO booking_system.projects (name, start_date, end_date, ate_operator, team,
                          sw_versions, additional_info, framework, setup_milestone) VALUES ('%s', '%s', '%s', '%s', '%s',
                          '%s', '%s', '%s', '%s');",
                            $project["name"],
                            $project["start_date"],
                            $project["end_date"],
                            $project["ate_operator"],
                            $project["team"],
                            $project["sw_versions"],
                            $project["additional_info"],
                            $project["framework"],
                            $project["setup_milestone"]);

        $this->db->query($query);
        if ($this->assert_error("Failed to add project")) return;

        if (!$this->add_derivatives($project)) return;
        if (!$this->add_links($project)) return;
        if (!$this->add_quality_packs($project)) return;
        $this->result = $project;
    }


    public function fetch_all(){
        if ($this->error) return;

        $this->result = Array();

        $query_result = $this->db->query("SELECT * FROM booking_system.projects;");
        if ($this->assert_error("Failed to fetch projects")) return;

        while($project = $query_result->fetch_assoc()){

            $project["derivatives"] = Array();

            $derivatives_query_result =  $this->db->query(sprintf("SELECT * FROM booking_system.derivatives WHERE project_name = '%s'",
                                                                    $project["name"]));
            if ($this->assert_error("Failed to fetch derivatives")) return;

            if ($derivatives_query_result){
                while ($derivative_row = $derivatives_query_result->fetch_assoc()){
                    $progress_query_result = $this->db->query("SELECT * FROM booking_system.preparation_progress WHERE id_derivative = " . $derivative_row["id"]);
                    $progress = $progress_query_result->fetch_assoc();
                    $derivative_row["progress"] = $progress;

                    array_push($project["derivatives"], $derivative_row);
                }
            }
            $quality_packs_query_result =  $this->db->query(sprintf("SELECT name FROM booking_system.quality_pack_stations WHERE project_name = '%s'",
                                                                        $project["name"]));
            if ($this->assert_error("Failed to fetch quality pack")) return;

            if ($quality_packs_query_result){
                $project["quality_pack_stations"] = Array();
                foreach($quality_packs_query_result->fetch_all() as $qp){
                    array_push($project["quality_pack_stations"], $qp[0]);
                }
            }

            $links_query_result = $this->db->query(sprintf("SELECT * FROM booking_system.links WHERE project_name = '%s'",
                                                             $project["name"]));
            if ($this->assert_error("Failed to fetch hyperlinks")) return;

            if ($links_query_result) {
                $project["links"] = Array();
                while ($link_row = $links_query_result->fetch_assoc()) {
                    array_push($project["links"], $link_row);
                }
            }

            array_push($this->result, $project);
        }
    }

    private function add_derivatives($project){

        if (array_key_exists("derivatives", $project)) {
            foreach ($project["derivatives"] as &$derivative) {
                $query = sprintf("INSERT INTO booking_system.derivatives (exec_station, build_station, link, project_name, name)
                                  VALUES ('%s', '%s', '%s', '%s', '%s');",
                                    $derivative["exec_station"],
                                    $derivative["build_station"],
                                    $derivative["link"],
                                    $project["name"],
                                    $derivative["name"]);

                $this->db->query($query);
                if ($this->assert_error("Failed to add derivative")) return false;

                $progress = $derivative["progress"];
                $query = sprintf("INSERT INTO booking_system.preparation_progress (id_derivative, wiring_designed,
                          wiring_implemented, af_created, sw_installed, licenses, af_configured, af_config_reviewed,
                          source_code_loaded, exec_success, wiring_pass) VALUES (%d, %d, %d, %d, %d, %d, %d, %d, %d, %d, %d)",
                    $this->db->insert_id, $progress['wiring_designed'], $progress['wiring_implemented'],
                    $progress['af_created'], $progress['sw_installed'], $progress['licenses'], $progress['af_configured'],
                    $progress['af_config_reviewed'], $progress['source_code_loaded'], $progress['exec_success'], $progress['wiring_pass']);
                $this->db->query($query);
                if ($this->assert_error("Failed to add preparation progress list")) return false;
            }
        }
        return true;
    }
    private function add_links($project){
        if (array_key_exists("links", $project)) {
            foreach ($project["links"] as $link) {
                $query = sprintf("INSERT INTO booking_system.links (link, description, project_name) VALUES ('%s', '%s', '%s')",
                                   $link["link"],
                                   $link["description"],
                                   $project["name"]);
                $this->db->query($query);
                if ($this->assert_error("Failed to add links")) return false;
            }
        }
        return true;
    }
    private function add_quality_packs($project){
        if (array_key_exists("quality_pack_stations", $project)) {
            foreach ($project["quality_pack_stations"] as $quality_pack_station) {
                $query = sprintf("INSERT INTO booking_system.quality_pack_stations (name, project_name) VALUES ('%s', '%s')",
                                   $quality_pack_station,
                                   $project["name"]);
                $this->db->query($query);
                if ($this->assert_error("Failed to add quality packs")) return false;
            }
        }
        return true;
    }
}
