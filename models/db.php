<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 3. 9. 2017
 * Time: 20:47
 */
function get_db_connection(){
    $server_name = "localhost";
    $username = "root";
    $password = "";

    $conn = new mysqli($server_name, $username, $password);
    return $conn;
}

