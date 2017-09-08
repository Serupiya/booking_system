<?php
/**
 * Created by PhpStorm.
 * User: Michal
 * Date: 3. 9. 2017
 * Time: 20:47
 */
/*
 * localhost

function get_db_connection(){
    $server_name = "localhost";
    $username = "root";
    $password = "";

    $conn = new mysqli($server_name, $username, $password);
    return $conn;
}
*/

//heroku
function get_db_connection(){
    $url = parse_url(getenv("CLEARDB_DATABASE_URL"));

    $server = $url["host"];
    $username = $url["user"];
    $password = $url["pass"];
    $db = substr($url["path"], 1);

    $conn = new mysqli($server, $username, $password, $db);
    return $conn;
}

function get_schema_name(){
    /*localhost
    return "booking_system";
    */

    //heroku
    return "heroku_426923c18edf463";

}