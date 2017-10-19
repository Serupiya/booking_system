<?php

//localhost

function get_db_connection(){
    $server_name = "localhost";
    $username = "root";
    $password = "admin";

    $conn = new mysqli($server_name, $username, $password);
    return $conn;
}


function get_schema_name(){
    return "booking_system";
}




/*
//heroku hosting
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

    return "heroku_426923c18edf463";

}
*/