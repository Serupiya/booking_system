<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 7. 9. 2017
 * Time: 11:52
 */

include_once "../models/global_event.php";

class GlobalEvent{
    private $global_event_model;
    function __construct(){
        $this->global_event_model = new GlobalEventModel();
    }
    function add($global_event){
        $this->global_event_model->add($global_event);
        return $this->global_event_model->result;
    }
    function delete($global_event){
        $this->global_event_model->delete($global_event);
        return $this->global_event_model->result;
    }
    function fetch_all(){
        $this->global_event_model->fetch_all();
        return $this->global_event_model->result;
    }
}