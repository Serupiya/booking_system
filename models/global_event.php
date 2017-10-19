<?php

include_once "base_model.php";

class GlobalEventModel extends BaseModel
{
    function __construct()
    {
        parent::__construct();
    }
    function add($event){
        if ($this->error) return;

        $this->escape_array($event);
        $query = sprintf("INSERT INTO global_events (name, start, end) VALUES ('%s', '%s', '%s');",
                            $event["name"],
                            $event["start"],
                            $event["end"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add global event")) return;
        $event["id"] = $this->db->insert_id;
        $this->result = $event;
    }
    function delete($event){
        if ($this->error) return;

        $this->escape_array($event);
        $query = sprintf("DELETE FROM global_events WHERE id = %d", $event["id"]);
        $this->db->query($query);
        if ($this->assert_error("Failed to add global event")) return;
        $this->result = $event;
    }
    function fetch_all(){
        if ($this->error) return;

        $this->result = Array();

        $query_result = $this->db->query("SELECT * FROM global_events;");
        if ($this->assert_error("Failed to fetch global events")) return;

        while($event = $query_result->fetch_assoc()) {
            array_push($this->result, $event);
        }
    }
}