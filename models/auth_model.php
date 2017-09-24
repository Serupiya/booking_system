<?php

/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 24. 9. 2017
 * Time: 11:43
 */
include_once "base_model.php";

class AuthModel extends BaseModel{
    function __construct()
    {
        parent::__construct();
    }
    public function get_rights($password_info){
        if ($this->error) return;

        $this->escape_array($password_info);

        $query = sprintf("SELECT * from authorization WHERE password = '%s'", $password_info["password"]);
        $query_result = $this->db->query($query);

        if ($this->assert_error("Failed to fetch password info")) return;

        $result = $query_result->fetch_assoc();
        if (!$result){
            $result = Array("level" => 0);
        }

        $this->result = $result;
    }
}