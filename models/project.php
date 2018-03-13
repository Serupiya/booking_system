<?php

include_once "base_model.php";

class ProjectModel extends BaseModel{
    function __construct()
    {
        parent::__construct();
    }

    public function delete($project){
        if ($this->error) return;

        $this->escape_array($project);

        $query = sprintf("DELETE FROM projects WHERE name = '%s'", $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete project")) return;
        else $this->result = Array("success" => true);

    }

    public function rename($project){
        if ($this->error) return;
        $this->escape_array($project);

        $query = sprintf("UPDATE projects SET name = '%s' WHERE name = '%s';",
            $project["new_name"],
            $project["old_name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to rename project")) return;
        $this->result = array("name"=>$project["new_name"]);
    }

    public function modify($project){
        if ($this->error) return;

        $this->escape_array($project);

        $query = sprintf("UPDATE projects SET start_date = STR_TO_DATE('%s', '%%m/%%d/%%Y'), end_date = STR_TO_DATE('%s', '%%m/%%d/%%Y'), team = '%s',
                          sw_versions = '%s', additional_info = '%s', framework = '%s', hw_versions = '%s' WHERE name = '%s';",
                            $project["start_date"],
                            $project["end_date"],
                    //        $project["ate_operator"],
                            $project["team"],
                            $project["sw_versions"],
                            $project["additional_info"],
                            $project["framework"],
                            $project["hw_versions"],
                            $project["name"]);
        $this->db->query($query);

        $query = sprintf("DELETE FROM derivatives WHERE project_name = '%s'",
                           $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old derivatives")) return;

        if (!$this->add_derivatives($project)) return;

        $query = sprintf("DELETE FROM links WHERE project_name = '%s'",
                           $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old links")) return;

        $query = sprintf("DELETE FROM project_events WHERE project_name = '%s'",
            $project["name"]);
        $this->db->query($query);

        //$this->db->query($query);
        if ($this->assert_error("Failed to delete old events")) return;

        $query = sprintf("DELETE FROM project_mafs WHERE project_name = '%s'",
            $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete old maf stations")) return;


        if (!$this->add_links($project)) return;
        if (!$this->add_project_events($project)) return;
        if (!$this->add_maf_stations($project)) return;

        $this->result = $project;
    }


    public function add($project)
    {
        if ($this->error) return;

        $this->escape_array($project);
        $project["color"] = $this->determine_project_color($project);
        $query = sprintf("INSERT INTO projects (name, start_date, end_date, team,
                          sw_versions, hw_versions, additional_info, framework, color) VALUES ('%s', STR_TO_DATE('%s', '%%m/%%d/%%Y'), STR_TO_DATE('%s', '%%m/%%d/%%Y'), '%s',
                          '%s', '%s', '%s', '%s', '%s');",
                            $project["name"],
                            $project["start_date"],
                            $project["end_date"],
                            //$project["ate_operator"],
                            $project["team"],
                            $project["sw_versions"],
                            $project["hw_versions"],
                            $project["additional_info"],
                            $project["framework"],
                            $project["color"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add project")) return;

        if (!$this->add_derivatives($project)) return;
        if (!$this->add_links($project)) return;
        if (!$this->add_project_events($project)) return;
        if (!$this->add_maf_stations($project)) return;
        $this->result = $project;
    }

    private function determine_project_color($project){
        $start_date_list = explode("/",$project["start_date"]); // m d y
        $end_date_list = explode("/",$project["end_date"]);
        $query = sprintf("select color from projects where abs(datediff(start_date, '%s-%s-%s')) < 365 || abs(datediff(end_date, '%s-%s-%s')) < 365; ",
            $end_date_list[2], $end_date_list[0], $end_date_list[1],  $start_date_list[2], $start_date_list[0], $start_date_list[1]);
        $query_result = $this->db->query($query);

        $colors = array('#cc3333', '#ffa700', '#e6be8a', '#ed872d', '#b03060', '#8a3324', '#6082b6',
            '#2a52be', '#ffa07a', '#b94e48', '#779ecb', '#507d2a', '#0014a8', '#e49b0f', '#85bb65',
            '#ff5349', '#80461b', '#a9203e', '#9ab973', '#cfb53b', '#006d5b', '#26619c', '#367588',
            '#0f4d92', '#5218fa', '#002e63', '#6a5acd', '#00563f', '#d19fe8', '#006b3c', '#e2062c',
            '#4682b4', '#746cc0', '#ff1dce', '#006994', '#65000b', '#3cd070', '#801818', '#ff43a4',
            '#2a8000', '#4997d0', '#89cff0', '#39ff14', '#fc0fc0', '#fb607f', '#98fb98', '#701c1c',
            '#c154c1', '#fe28a2', '#f4c430', '#cc0000', '#007fff', '#ffcc33', '#6050dc', '#fd0e35',
            '#873260', '#009000', '#77dd77', '#abcdef', '#ff0028', '#ff0800', '#cc4e5c', '#d2b48c',
            '#ff4040', '#004225', '#ca2c92', '#1fcecb', '#fcc200', '#de5d83', '#cc5500', '#23297a',
            '#654321', '#01796f', '#5a4fcf', '#e62020', '#d73b3e', '#3f00ff', '#7b1113', '#f9429e',
            '#ccff00', '#cc7722', '#cf71af', '#a81c07', '#a8e4a0', '#ff2052', '#ff0000', '#cd9575',
            '#32cd32', '#da8a67', '#f400a1', '#014421', '#cba135', '#90ee90', '#cb4154', '#e8000d',
            '#f49ac2', '#9acd32', '#228b22', '#872657', '#ff3800', '#c23b22', '#fc89ac', '#035096',
            '#93c572', '#195905', '#a52a2a', '#6f00ff', '#000080', '#d2691e', '#b5651d', '#ff6347',
            '#b38b6d', '#69359c', '#d1e231', '#003399', '#004953', '#db7093', '#808000', '#d99058',
            '#ffbf00', '#318ce7', '#cc6666', '#29ab87', '#560319', '#ff6e4a', '#d68a59', '#882d17',
            '#73c2fb', '#ffc40c', '#a0785a', '#e75480', '#e32636', '#966fd6', '#ffae42', '#1560bd',
            '#00009c', '#990000', '#000f89', '#4169e1', '#e66771', '#b5a642', '#b53389', '#0072bb',
            '#3fff00', '#e25822', '#f4a460', '#48d1cc', '#ffcba4', '#e5aa70', '#ff8f00', '#c9dc87',
            '#800080', '#0892d0', '#cb410b', '#ef98aa', '#50c878', '#ff0040', '#d70040', '#0f52ba',
            '#fc6c85', '#0033aa', '#e34234', '#00fa9a', '#0fc0fc', '#ff033e', '#87ceeb', '#c2b280',
            '#00ff7f', '#ff1493', '#20b2aa', '#8b4513', '#cc00cc', '#00693e', '#30ba8f', '#ff8c00',
            '#ff4500', '#7cfc00', '#cf1020', '#ffa812', '#f88379', '#96ded1', '#cc8899', '#d9004c',
            '#6b8e23', '#c04000', '#008000', '#ff2800', '#ff55a3', '#0054b4', '#b7410e', '#d70a53',
            '#e30b5d', '#ff003f', '#f94d00', '#03c03c', '#bfff00', '#e30022', '#0047ab', '#ff33cc',
            '#ff007f', '#af4035', '#273be2', '#e2725b', '#ae0c00', '#a50b5e', '#f08080', '#f28500',
            '#4b0082', '#b87333', '#2e8b57', '#deb887', '#aaf0d1', '#0000cd', '#008080', '#bb6528',
            '#ff355e', '#b57281', '#004b49', '#191970', '#b666d2', '#e3256b', '#9aceeb', '#009e60',
            '#66ff00', '#71bc78', '#8a2be2', '#bf94e4', '#ff6961', '#ff2400', '#bdb76b', '#c32148',
            '#30d5c8', '#003153', '#a40000', '#00ff00', '#ff9933', '#ff7518', '#e5b73b', '#93ccea',
            '#daa520', '#dc143c', '#702963', '#e1a95f', '#ff4f00', '#d71868', '#f64a8a', '#b31b1b',
            '#76ff7a', '#9bc4e2', '#ffb300', '#0095b6', '#ffa6c9', '#73a9c2', '#c71585', '#7851a9',
            '#9955bb', '#be0032', '#00cc99', '#1034a6', '#f56991', '#6699cc', '#0070ff', '#66023c',
            '#ff91a4', '#ffb7c5', '#ff9966', '#e03c31', '#417dc1', '#ab4e52', '#722f37', '#1ca9c9',
            '#99badd', '#1c39bb', '#c41e3a', '#138808', '#7b68ee', '#0bda51', '#a67b5b', '#ba55d3',
            '#ffb6c1', '#e68fac', '#9932cc', '#da3287', '#bd33a4', '#6495ed', '#87cefa', '#ed9121',
            '#ce2029', '#8878c3', '#e97451', '#a7fc00', '#b22222', '#00a86b', '#059033', '#7fff00',
            '#74c365', '#de3163', '#c54b8c', '#ffb347', '#e25098', '#e4717a', '#f78fa7', '#e3a857',
            '#e0115f', '#0abab5', '#bf00ff', '#fe6f5e', '#08457e', '#e4d00a', '#ffa343', '#fbceb1',
            '#fc8eac', '#ff9999', '#483d8b', '#8f00ff', '#e18e96', '#003366', '#78184a', '#e48400',
            '#800000', '#ff6700', '#996515', '#a4c639', '#bb3385', '#fd5e53', '#933d41', '#98ff98',
            '#b06500', '#fdbcb4', '#006600', '#cd5c5c', '#8b0000', '#987654', '#e52b50', '#cd5b45',
            '#deaa88', '#adff2f', '#6c541e', '#087830', '#00755e', '#480607', '#3eb489', '#b2ec5d',
            '#002fa7', '#177245', '#ff9f00', '#b3446c', '#ffcc00', '#9966cc', '#ff8c69', '#ec3b83',
            '#ff004f', '#1dacd6', '#ff0038', '#e9967a', '#0038a8', '#de6fa1', '#9457eb', '#00008b',
            '#007aa5', '#c19a6b', '#f6adc6', '#b76e79', '#704214', '#967117', '#734f96', '#e08d3c',
            '#ff5a36', '#006a4e', '#cd5700', '#007ba7', '#0000ff', '#da9100', '#0067a5', '#32127a',
            '#45cea2', '#ffbd88', '#1164b4', '#ffa500', '#bab86c', '#008b8b', '#a1caf1', '#ff66cc',
            '#0d98ba', '#5d8aa8', '#e9692c', '#fe59c2', '#3cb371', '#002147', '#00ced1', '#d40000',
            '#cd7f32', '#bdda57', '#eb4c42', '#ef3038', '#0077be', '#536895', '#b8860b', '#800020',
            '#88d8c0', '#007474', '#ff69b4', '#8db600', '#66ddaa', '#9370db', '#ffba00', '#ffc87c',
            '#21abcd', '#4cbb17', '#f77fbe', '#ff8243', '#1e90ff', '#0073cf', '#ff7f50', '#893f45',
            '#446ccf', '#8b008b', '#00bfff', '#c90016', '#9400d3');

        if ($query_result->num_rows == 0){
            return $colors[array_rand($colors)];
        }

        while($color_array = $query_result->fetch_assoc()) {
            //echo $color_array["color"] . ";";
            if (($index = array_search($color_array["color"], $colors)) !== false){
                //echo "(".$index.")";
                array_splice($colors, $index, 1);
            }
        }
        if (count($colors) > 0){
            return $colors[array_rand($colors)];
        } else{
            return "black";
        }


    }


    public function fetch_all(){
        if ($this->error) return;

        $this->result = Array();
        //ate_operator
        $query_result = $this->db->query("SELECT name, DATE_FORMAT(start_date, '%m/%d/%Y') 'start_date', 
                          DATE_FORMAT(end_date, '%m/%d/%Y') 'end_date', team,
                          sw_versions, additional_info, framework, color, hw_versions FROM projects;");
        if ($this->assert_error("Failed to fetch projects")) return;

        while($project = $query_result->fetch_assoc()){

            $project["derivatives"] = Array();

            $derivatives_query_result =  $this->db->query(sprintf("SELECT * FROM derivatives WHERE project_name = '%s'",
                                                                    $project["name"]));
            if ($this->assert_error("Failed to fetch derivatives")) return;
            if ($this->assert_error("Failed to fetch derivatives")) return;

            if ($derivatives_query_result){
                while ($derivative_row = $derivatives_query_result->fetch_assoc()){
                    $progress_query_result = $this->db->query("SELECT * FROM preparation_progress WHERE id_derivative = " . $derivative_row["id"]);
                    $progress = $progress_query_result->fetch_assoc();
                    $derivative_row["progress"] = $progress;

                    array_push($project["derivatives"], $derivative_row);
                }
            }

            $links_query_result = $this->db->query(sprintf("SELECT * FROM links WHERE project_name = '%s'",
                                                             $project["name"]));
            if ($this->assert_error("Failed to fetch hyperlinks")) return;

            if ($links_query_result) {
                $project["links"] = Array();
                while ($link_row = $links_query_result->fetch_assoc()) {
                    array_push($project["links"], $link_row);
                }
            }

            $projects_query_result = $this->db->query(sprintf("SELECT DATE_FORMAT(date, '%%m/%%d/%%Y') 'date', description, symbol, project_name FROM project_events WHERE project_name = '%s'",
                $project["name"]));

            if ($projects_query_result) {
                $project["events"] = Array();
                while ($event_row = $projects_query_result->fetch_assoc()) {
                    array_push($project["events"], $event_row);
                }
            }

            $project["maf_stations"] = Array();
            $maf_query_result = $this->db->query(sprintf("SELECT * FROM project_mafs WHERE project_name = '%s'",
                $project["name"]));

            if ($maf_query_result) {
                while ($maf = $maf_query_result->fetch_assoc()) {
                    array_push($project["maf_stations"], $maf["maf_name"]);
                }
            }

            array_push($this->result, $project);
        }
    }

    private function add_derivatives($project){

        if (array_key_exists("derivatives", $project)) {
            foreach ($project["derivatives"] as &$derivative) {
                $query = sprintf("INSERT INTO derivatives (exec_station, build_station, link, project_name, name, ate_operator)
                                  VALUES ('%s', '%s', '%s', '%s', '%s', '%s');",
                                    $derivative["exec_station"],
                                    $derivative["build_station"],
                                    $derivative["link"],
                                    $project["name"],
                                    $derivative["name"],
                                    $derivative["ate_operator"]);

                $this->db->query($query);
                if ($this->assert_error("Failed to add derivative")) return false;

                $progress = $derivative["progress"];
                $query = sprintf("INSERT INTO preparation_progress (id_derivative, wiring_designed,
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
                $query = sprintf("INSERT INTO links (link, description, project_name) VALUES ('%s', '%s', '%s')",
                                   $link["link"],
                                   $link["description"],
                                   $project["name"]);
                $this->db->query($query);
                if ($this->assert_error("Failed to add links")) return false;
            }
        }
        return true;
    }

    private function add_maf_stations($project){
        if (array_key_exists("maf_stations", $project)) {
            foreach ($project["maf_stations"] as $station) {
                $query = sprintf("INSERT INTO project_mafs (project_name, maf_name) VALUES ('%s', '%s')",
                    $project["name"],
                    $station);
                $this->db->query($query);
                if ($this->assert_error("Failed to add maf stations")) return false;
            }
        }
        return true;
    }

    private function add_project_events($project){
        if (array_key_exists("events", $project)) {
            foreach ($project["events"] as $event) {
                $query = sprintf("INSERT INTO project_events (project_name, description, date, symbol) VALUES ('%s', '%s', STR_TO_DATE('%s', '%%m/%%d/%%Y'), '%s')",
                    $project["name"],
                    $event["description"],
                    $event["date"],
                    $event["symbol"]);

                $this->db->query($query);
                if ($this->assert_error("Failed to add project events")) return false;
            }
        }
        return true;
    }

}
