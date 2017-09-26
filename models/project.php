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

        $query = sprintf("DELETE FROM projects WHERE name = '%s'", $project["name"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to delete project")) return;
        else $this->result = Array("success" => true);

    }

    public function modify($project){
        if ($this->error) return;

        $this->escape_array($project);

        $query = sprintf("UPDATE projects SET start_date = STR_TO_DATE('%s', '%%m/%%d/%%Y'), end_date = STR_TO_DATE('%s', '%%m/%%d/%%Y'), ate_operator = '%s', team = '%s',
                          sw_versions = '%s', additional_info = '%s', framework = '%s', hw_versions = '%s' WHERE name = '%s';",
                            $project["start_date"],
                            $project["end_date"],
                            $project["ate_operator"],
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

        $this->db->query($query);
        if ($this->assert_error("Failed to delete old events")) return;

        if (!$this->add_links($project)) return;
        if (!$this->add_project_events($project)) return;


        $this->result = $project;
    }


    public function add($project)
    {
        if ($this->error) return;

        $this->escape_array($project);
        $project["color"] = $this->determine_project_color($project);
        $query = sprintf("INSERT INTO projects (name, start_date, end_date, ate_operator, team,
                          sw_versions, hw_versions, additional_info, framework, color) VALUES ('%s', STR_TO_DATE('%s', '%%m/%%d/%%Y'), STR_TO_DATE('%s', '%%m/%%d/%%Y'), '%s', '%s',
                          '%s', '%s', '%s', '%s', '%s');",
                            $project["name"],
                            $project["start_date"],
                            $project["end_date"],
                            $project["ate_operator"],
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
        $this->result = $project;
    }

    private function determine_project_color($project){
        $start_date_list = explode("/",$project["start_date"]); // m d y
        $end_date_list = explode("/",$project["end_date"]);
        $query = sprintf("select color from projects where abs(datediff(start_date, '%s-%s-%s')) < 365 || abs(datediff(end_date, '%s-%s-%s')) < 365; ",
            $end_date_list[2], $end_date_list[0], $end_date_list[1],  $start_date_list[2], $start_date_list[0], $start_date_list[1]);
        $query_result = $this->db->query($query);

        $colors = array('#a4dded', '#cc3333', '#ffa700', '#7fffd4', '#e6be8a', '#ed872d', '#b03060', '#1a2421',
            '#ffe4c4', '#fff600', '#8a3324', '#6082b6', '#2a52be', '#ffa07a', '#b94e48', '#779ecb', '#778899',
            '#507d2a', '#0014a8', '#e49b0f', '#004040', '#85bb65', '#ff6fff', '#355e3b', '#ff5349', '#80461b',
            '#a9203e', '#9ab973', '#cfb53b', '#006d5b', '#26619c', '#367588', '#0f4d92', '#5218fa', '#534b4f',
            '#f3e5ab', '#002e63', '#6a5acd', '#00563f', '#d19fe8', '#006b3c', '#e2062c', '#18453b', '#cb99c9',
            '#dcd0ff', '#fefe22', '#fadfad', '#4682b4', '#746cc0', '#78866b', '#ff1dce', '#006994', '#65000b',
            '#f8d568', '#6f4e37', '#3cd070', '#801818', '#fddde6', '#ff43a4', '#2a8000', '#4997d0', '#89cff0',
            '#39ff14', '#100c08', '#fc0fc0', '#fb607f', '#5f9ea0', '#98fb98', '#701c1c', '#c154c1', '#f0ffff',
            '#c8a2c8', '#fe28a2', '#f4c430', '#808080', '#cc0000', '#007fff', '#e6e8fa', '#c08081', '#ace1af',
            '#ffcc33', '#6050dc', '#fd0e35', '#6e7f80', '#f4bbff', '#873260', '#009000', '#77dd77', '#faf0be',
            '#abcdef', '#ff0028', '#ff0800', '#cc4e5c', '#f4c2c2', '#d2b48c', '#bcd4e6', '#ff4040', '#004225',
            '#ca2c92', '#592720', '#1fcecb', '#eae0c8', '#8b8589', '#fcc200', '#918151', '#de5d83', '#ffebcd',
            '#98777b', '#ffc1cc', '#cc5500', '#23297a', '#654321', '#df73ff', '#01796f', '#5a4fcf', '#e62020',
            '#915f6d', '#d73b3e', '#3f00ff', '#7b1113', '#f9429e', '#7df9ff', '#fc74fd', '#ccff00', '#cc7722',
            '#cf71af', '#a81c07', '#123524', '#a8e4a0', '#ff2052', '#ff0000', '#979aaa', '#cd9575', '#ffe4e1',
            '#ff00ff', '#32cd32', '#ffd1dc', '#da8a67', '#ffdab9', '#00ffff', '#fcf75e', '#f0dc82', '#f400a1',
            '#ecebbd', '#014421', '#8fbc8f', '#dda0dd', '#cba135', '#90ee90', '#cb4154', '#e8000d', '#f49ac2',
            '#9acd32', '#228b22', '#872657', '#ff3800', '#0f0f0f', '#c23b22', '#fc89ac', '#035096', '#93c572',
            '#9bddff', '#536878', '#195905', '#f984e5', '#a52a2a', '#6f00ff', '#ffd700', '#000080', '#fad6a5',
            '#dcdcdc', '#c3b091', '#efdecd', '#d2691e', '#b5651d', '#ff6347', '#b38b6d', '#69359c', '#696969',
            '#d1e231', '#003399', '#004953', '#db7093', '#967bb6', '#e6e6fa', '#808000', '#d99058', '#e3dac9',
            '#ffbf00', '#9f8170', '#318ce7', '#cc6666', '#29ab87', '#560319', '#ff6e4a', '#d68a59', '#882d17',
            '#796878', '#73c2fb', '#ace5ee', '#ffc40c', '#a0785a', '#e75480', '#e6e200', '#e32636', '#966fd6',
            '#ffae42', '#1560bd', '#00009c', '#a2a2d0', '#49796b', '#990000', '#000f89', '#4169e1', '#e66771',
            '#bc8f8f', '#b5a642', '#b53389', '#674846', '#0072bb', '#eedc82', '#ecd540', '#3fff00', '#e25822',
            '#f4a460', '#48d1cc', '#ffcba4', '#e5aa70', '#905d5d', '#ff8f00', '#ffd800', '#c9dc87', '#ddadaf',
            '#cfcfc4', '#c9c0bb', '#800080', '#0892d0', '#8c92ac', '#ffe135', '#cb410b', '#ef98aa', '#50c878',
            '#ff0040', '#d70040', '#0f52ba', '#fc6c85', '#0033aa', '#e34234', '#a9a9a9', '#ffff00', '#00fa9a',
            '#0fc0fc', '#ff033e', '#87ceeb', '#c2b280', '#00ff7f', '#ff1493', '#20b2aa', '#d3d3d3', '#8b4513',
            '#edc9af', '#cc00cc', '#e0b0ff', '#00693e', '#30ba8f', '#ff8c00', '#ff4500', '#7cfc00', '#986960',
            '#cf1020', '#ffa812', '#fdd5b1', '#f88379', '#96ded1', '#cc8899', '#d9004c', '#9678b6', '#6b8e23',
            '#f5deb3', '#f7e98e', '#c04000', '#fadadd', '#008000', '#5d3954', '#673147', '#ff2800', '#ffdf00',
            '#ff55a3', '#0054b4', '#b7410e', '#d70a53', '#e30b5d', '#997a8d', '#ff003f', '#f94d00', '#03c03c',
            '#bfff00', '#f0e68c', '#e30022', '#0047ab', '#ff33cc', '#ff007f', '#af4035', '#273be2', '#e2725b',
            '#9d81ba', '#ae0c00', '#d8bfd8', '#a50b5e', '#915c83', '#add8e6', '#f08080', '#f28500', '#08e8de',
            '#fba0e3', '#4b0082', '#eee8aa', '#e9d66b', '#df00ff', '#848482', '#b87333', '#2e8b57', '#b0e0e6',
            '#556b2f', '#deb887', '#aaf0d1', '#4b3621', '#536872', '#555555', '#0000cd', '#b39eb5', '#50404d',
            '#008080', '#eee600', '#bb6528', '#ff355e', '#996666', '#b57281', '#8a795d', '#004b49', '#191970',
            '#b666d2', '#e3256b', '#9aceeb', '#009e60', '#fbaed2', '#66ff00', '#71bc78', '#21421e', '#fafad2',
            '#8a2be2', '#bf94e4', '#ff6961', '#ff2400', '#bdb76b', '#c32148', '#30d5c8', '#003153', '#a40000',
            '#00ff00', '#c4c3d0', '#ffbcd9', '#ff9933', '#fdfd96', '#f5f5dc', '#ff7518', '#e5b73b', '#66424d',
            '#a3c1ad', '#93ccea', '#b2ffff', '#e4d96f', '#ffef00', '#daa520', '#36454f', '#dc143c', '#fff700',
            '#702963', '#e1a95f', '#1e4d2b', '#ff4f00', '#d71868', '#f64a8a', '#b31b1b', '#d0f0c0', '#76ff7a',
            '#708090', '#f8de7e', '#9bc4e2', '#ee82ee', '#ffb300', '#fbec5d', '#013220', '#0095b6', '#ffa6c9',
            '#73a9c2', '#ffff99', '#96c8a2', '#c71585', '#aa98a9', '#7851a9', '#9955bb', '#2c1608', '#704241',
            '#da70d6', '#be0032', '#483c32', '#00cc99', '#1034a6', '#f56991', '#6699cc', '#fbcce7', '#0070ff',
            '#66023c', '#ff91a4', '#ffb7c5', '#ff9966', '#e03c31', '#417dc1', '#4f7942', '#ab4e52', '#722f37',
            '#1ca9c9', '#faebd7', '#a0d6b4', '#99badd', '#1c39bb', '#c41e3a', '#138808', '#dbd7d2', '#7b68ee',
            '#0bda51', '#a67b5b', '#b2beb5', '#86608e', '#ba55d3', '#bc987e', '#ffb6c1', '#414833', '#ffe5b4',
            '#e68fac', '#9932cc', '#f0f8ff', '#da3287', '#bd33a4', '#000000', '#6495ed', '#87cefa', '#ed9121',
            '#ce2029', '#8878c3', '#ccccff', '#e97451', '#a7fc00', '#b22222', '#00a86b', '#f4f0ec', '#059033',
            '#f0e130', '#7fff00', '#ffefd5', '#74c365', '#de3163', '#a9ba9d', '#c54b8c', '#674c47', '#836953',
            '#ffb347', '#e25098', '#4d5d53', '#e4717a', '#f78fa7', '#e3a857', '#e0115f', '#f0ead6', '#2f4f4f',
            '#0abab5', '#bf00ff', '#fe6f5e', '#08457e', '#f984ef', '#e4d00a', '#682860', '#ffa343', '#fbceb1',
            '#fc8eac', '#a2add0', '#ff9999', '#483d8b', '#8f00ff', '#c0c0c0', '#1c352d', '#e18e96', '#79443b',
            '#003366', '#78184a', '#465945', '#e48400', '#800000', '#ff6700', '#91a3b0', '#fe4eda', '#996515',
            '#a4c639', '#a99a86', '#bb3385', '#645452', '#fd5e53', '#933d41', '#321414', '#98ff98', '#b06500',
            '#fdbcb4', '#fdee00', '#006600', '#cd5c5c', '#3d2b1f', '#8b0000', '#987654', '#ffff31', '#e52b50',
            '#cd5b45', '#deaa88', '#adff2f', '#3c1414', '#6c541e', '#087830', '#b19cd9', '#00755e', '#480607',
            '#3eb489', '#b2ec5d', '#002fa7', '#177245', '#414a4c', '#addfad', '#98817b', '#ff9f00', '#b3446c',
            '#ffcc00', '#9966cc', '#ff8c69', '#ec3b83', '#ff004f', '#1dacd6', '#ff0038', '#e9967a', '#0038a8',
            '#de6fa1', '#9457eb', '#00008b', '#007aa5', '#b784a7', '#c19a6b', '#f6adc6', '#b76e79', '#704214',
            '#967117', '#734f96', '#e08d3c', '#fff44f', '#ff5a36', '#006a4e', '#cd5700', '#007ba7', '#d6cadd',
            '#0000ff', '#663854', '#614051', '#e7accf', '#da9100', '#0067a5', '#32127a', '#45cea2', '#ffbd88',
            '#1164b4', '#8a496b', '#afeeee', '#ffa500', '#bab86c', '#008b8b', '#87a96b', '#a1caf1', '#ffdb58',
            '#ff66cc', '#0d98ba', '#4b5320', '#ffdead', '#5d8aa8', '#e9692c', '#fe59c2', '#3cb371', '#002147',
            '#00ced1', '#d40000', '#cd7f32', '#bdda57', '#eb4c42', '#ef3038', '#0077be', '#536895', '#b8860b',
            '#800020', '#88d8c0', '#007474', '#ff69b4', '#8db600', '#66ddaa', '#9370db', '#fae7b5', '#aec6cf',
            '#ffba00', '#ffc87c', '#21abcd', '#fada5e', '#4cbb17', '#f77fbe', '#ff8243', '#1e90ff', '#ff77ff',
            '#0073cf', '#ff7f50', '#893f45', '#446ccf', '#8b008b', '#738678', '#00bfff', '#ffc0cb', '#c90016',
            '#9400d3', '#00ffef');

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

        $query_result = $this->db->query("SELECT name, DATE_FORMAT(start_date, '%m/%d/%Y') 'start_date', 
                          DATE_FORMAT(end_date, '%m/%d/%Y') 'end_date', ate_operator, team,
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

            array_push($this->result, $project);
        }
    }

    private function add_derivatives($project){

        if (array_key_exists("derivatives", $project)) {
            foreach ($project["derivatives"] as &$derivative) {
                $query = sprintf("INSERT INTO derivatives (exec_station, build_station, link, project_name, name)
                                  VALUES ('%s', '%s', '%s', '%s', '%s');",
                                    $derivative["exec_station"],
                                    $derivative["build_station"],
                                    $derivative["link"],
                                    $project["name"],
                                    $derivative["name"]);

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
    private function add_project_events($project){
        if (array_key_exists("events", $project)) {
            foreach ($project["events"] as $event) {
                $query = sprintf("INSERT INTO project_events (project_name, description, date, symbol) VALUES ('%s', '%s', STR_TO_DATE('%s', '%%m/%%d/%%Y'), '%s')",
                    $project["name"],
                    $event["description"],
                    $event["date"],
                    $event["symbol"]);
                $this->db->query($query);
                if ($this->assert_error("Failed to add links")) return false;
            }
        }
        return true;
    }

}
