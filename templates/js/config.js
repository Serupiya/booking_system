/**
 * Created by Michal on 7. 9. 2017.
 */


function load_config_dialog(){
    $("#config_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth:600,
        height: 600,
        buttons: {
            "Close": function(){
                $(this).dialog("close");
            }
        },
        close: function(){
            block_screen_with_load();
            config_to_visuals();
            load_page_structure();
            unblock_screen_with_load();

        }
    });
    $("#config_tab_switch").tabs()
    $("#open_config").click(function(){
        $("#config_dialog").dialog("open");
    });

    init_add_ate_operator_button();
    init_add_teams_button();
    init_add_build_station_button();
    init_add_exec_station_button();

}




// ATE_OPERATOR

function init_add_ate_operator_button(){
    $("#add_ate_operator_config").click(function(){
        if ($("#ate_operator_add_name").val() === ""){
            $("#validation_error_msg").empty();
            $("#validation_error_msg").append("<p>You must fill out all fields</p>");
            $("#validation_error_msg").dialog("open");
        } else{
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: "/views/config/add_operator.php",
                data: {"name": $("#ate_operator_add_name").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["ate_operators"].push(data);
                        add_ate_operator_to_list(data);
                    }
                    unblock_screen_with_load();

                },
                error: function (request, status, error) {
                    show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                    console.error(request, status, error);
                    unblock_screen_with_load();
                }
            });
        }
    })
}

function add_ate_operator_to_list(operator){
    var container = $("<div></div>");
    container.append("<span class='one_field'>" + operator["name"] +"</span>");
    var delete_button = $("<button style='color:indianred' class='ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    $("#ate_operators_config_list").append(container);
    delete_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/delete_operator.php",
            data: {"id": operator["id"]},
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["ate_operators"].length; i++){
                        if (config["ate_operators"][i]["id"] === data["id"]){
                            config["ate_operators"].splice(i, 1);
                        }
                    }
                    container.remove();
                }
                unblock_screen_with_load();

            },
            error: function (request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
}

// END ATE_OPERATOR


// TEAM

function init_add_teams_button(){
    $("#add_team_config").click(function(){
        if ($("#team_config_add_name").val() === ""){
            $("#validation_error_msg").empty();
            $("#validation_error_msg").append("<p>You must fill out all fields</p>");
            $("#validation_error_msg").dialog("open");
        } else{
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: "/views/config/add_team.php",
                data: {"name": $("#team_config_add_name").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["teams"].push(data);
                        add_team_to_list(data);
                    }
                    unblock_screen_with_load();

                },
                error: function (request, status, error) {
                    show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                    console.error(request, status, error);
                    unblock_screen_with_load();
                }
            });
        }
    })
}



function add_team_to_list(team){
    var container = $("<div></div>");
    container.append("<span class='one_field'>" + team["name"] +"</span>");
    var delete_button = $("<button style='color:indianred' class='ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    $("#teams_config_list").append(container);
    delete_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/delete_team.php",
            data: {"id": team["id"]},
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["teams"].length; i++){
                        if (config["teams"][i]["id"] === data["id"]){
                            config["teams"].splice(i, 1);
                        }
                    }
                    container.remove();
                }
                unblock_screen_with_load();

            },
            error: function (request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
}

// END TEAM

// BUILD_STATION

function init_add_build_station_button(){
    $("#add_build_station_config").click(function(){
        if ($("#build_station_config_add_name").val() === "" || $("#build_station_config_add_link").val() === ""){
            $("#validation_error_msg").empty();
            $("#validation_error_msg").append("<p>You must fill out all fields</p>");
            $("#validation_error_msg").dialog("open");
        } else{
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: "/views/config/add_build_station.php",
                data: {"name": $("#build_station_config_add_name").val(),
                       "link": linkify($("#build_station_config_add_link").val())},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["build_stations"].push(data);
                        add_build_station_to_list(data);
                    }
                    unblock_screen_with_load();

                },
                error: function (request, status, error) {
                    show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                    console.error(request, status, error);
                    unblock_screen_with_load();
                }
            });
        }
    })
}



function add_build_station_to_list(build_station){
    var container = $("<div></div>");
    container.append("<span class='two_fields'>" + build_station["name"] +"</span>");
    container.append("<span class='two_fields'>" + build_station["link"] +"</span>");
    var delete_button = $("<button style='color:indianred' class='ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    $("#build_stations_config_list").append(container);
    delete_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/delete_team.php",
            data: {"id": build_station["id"]},
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["build_stations"].length; i++){
                        if (config["build_stations"][i]["id"] === data["id"]){
                            config["build_stations"].splice(i, 1);
                        }
                    }
                    container.remove();
                }
                unblock_screen_with_load();

            },
            error: function (request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
}

// END BUILD STATION


// EXEC STATION
function init_add_exec_station_button(){
    $("#add_exec_machine_config").click(function(){
        if ($("#exec_machine_config_add_name").val() === "" || $("#exec_machine_config_add_location").val() === ""
            || $("#exec_machine_config_add_framework").val() === ""){

            $("#validation_error_msg").empty();
            $("#validation_error_msg").append("<p>You must fill out all fields</p>");
            $("#validation_error_msg").dialog("open");
        } else{
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: "/views/config/add_exec_station.php",
                data: {"name": $("#exec_machine_config_add_name").val(),
                       "location": $("#exec_machine_config_add_location").val(),
                       "framework": $("#exec_machine_config_add_framework").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["exec_stations"].push(data);
                        add_exec_station_to_list(data);
                    }
                    unblock_screen_with_load();

                },
                error: function (request, status, error) {
                    show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                    console.error(request, status, error);
                    unblock_screen_with_load();
                }
            });
        }
    })
}



function add_exec_station_to_list(exec_station){
    var container = $("<div></div>");
    container.append("<span class='three_fields'>" + exec_station["name"] +"</span>");
    container.append("<span class='three_fields'>" + exec_station["framework"] +"</span>");
    container.append("<span class='three_fields'>" + exec_station["location"] +"</span>");
    var delete_button = $("<button style='color:indianred' class='ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    $("#exec_machines_config_list").append(container);
    delete_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/delete_exec_station.php",
            data: {"id": exec_station["id"]},
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["exec_stations"].length; i++){
                        if (config["exec_stations"][i]["id"] === data["id"]){
                            config["exec_stations"].splice(i, 1);
                        }
                    }
                    container.remove();
                }
                unblock_screen_with_load();

            },
            error: function (request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
}

function config_to_visuals(){
    build_machines = [];
    exec_machines = [];
    ate_operators = [];
    teams = [];
    exec_machine_frameworks = {};
    exec_locations = {};
    build_machine_links = {};
    $.each(config["build_stations"], function(i, bm){
        add_build_station_to_list(bm);
        build_machines.push(bm["name"]);
        build_machine_links[bm["name"]] = bm["link"];
    });
    if (build_machines.indexOf("TBD") === -1){
        build_machines.push("TBD");
    }
    $.each(config["exec_stations"], function(i, ex){
        add_exec_station_to_list(ex);
        exec_machines.push(ex["name"]);
        if (exec_locations[ex["location"]] === undefined){
            exec_locations[ex["location"]] = [ex["name"]];
        } else{
            exec_locations[ex["location"]].push(ex["name"]);
        }
        if (exec_machine_frameworks[ex["framework"]] === undefined){
            exec_machine_frameworks[ex["framework"]] = [ex["name"]];
        } else{
            exec_machine_frameworks[ex["framework"]].push(ex["name"]);
        }

    });
    if (exec_machines.indexOf("TBD") === -1){
        exec_machines.push("TBD");
    }
    $.each(config["teams"], function(i, team){
        add_team_to_list(team);
        teams.push(team["name"]);
    });
    $.each(config["ate_operators"], function(i, operator){
        add_ate_operator_to_list(operator);
        ate_operators.push(operator["name"]);
    });
}