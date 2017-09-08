<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 6. 9. 2017
 * Time: 18:30
 */

class BaseModel{
    public $result;
    public $error;

    function __construct()
    {
        include_once "db.php";
        $this->db = get_db_connection();
        $this->db->select_db(get_schema_name());
        if ($this->db->connect_error) {
            $this->return_error("Failed to connect to the database; error: " . $this->db->connect_error);
        }
    }

    protected function assert_error($msg){
        if ($this->db->error){
            $this->return_error("Database error (" . $msg . "): " .  $this->db->error);
            return true;
        }
        return false;
    }

    protected function return_error($msg){
        $this->result = Array("error" => $msg);
        $this->error = true;
    }

    protected function escape_array(&$array){
        foreach ($array as &$element) {
            if (is_string($element)) {
                $element = str_replace(Array("\"", "'"), "", $element);
                $element = $this->db->real_escape_string($element);
            } else if (is_array($element)) {
                $this->escape_array($element);
            }
        }
    }
}