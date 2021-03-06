<?php

include_once "../models/auth_model.php";

class Authorization
{
    private $auth_model;

    function __construct()
    {
        $this->auth_model = new AuthModel();
    }

    function get_rights($password_info){
        $this->auth_model->get_rights($password_info);
        return $this->auth_model->result;
    }
}