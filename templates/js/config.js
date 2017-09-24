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
                data: {"name": $("#ate_operator_add_name").val(),
                       "color": $("#ate_operator_add_color").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["ate_operators"].push(data);
                        add_ate_operator_to_list(data);
                    }
                    jscolor.installByClassName("jscolor");
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
    var container = $("<div style='width: calc(100% - 13px);float: left;clear: both;'></div>");
    var delete_button = $("<button class='config_delete_btn ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    var name = $("<input disabled class='text ui-widget-content ui-corner-all'>");
    var color = $("<input class='jscolor text ui-widget-content ui-corner-all'>");
    name.val(operator["name"]);
    color.val(operator["color"]);
    $.each([name, color], function(){
        var input_container = $("<div class='two_fields'></div>");
        input_container.append(this);
        container.append(input_container);
    });
    var modify_button = $("<button class='config_modify_btn ui-button ui-corner-all ui-widget'>OK</button>");
    container.append(modify_button);
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
    modify_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/modify_operator.php",
            data: {"id": operator["id"], "name": name.val(), "color": color.val() },
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["ate_operators"].length; i++){
                        if (config["ate_operators"][i]["id"] === data["id"]){
                            config["ate_operators"][i] = data;
                        }
                    }
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
                data: {"name": $("#team_config_add_name").val(), "color": $("#team_config_add_color").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["teams"].push(data);
                        add_team_to_list(data);
                    }
                    jscolor.installByClassName("jscolor");
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
    var container = $("<div style='width: calc(100% - 13px);float: left;clear: both;'></div>");
    var delete_button = $("<button class='config_delete_btn ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    var name = $("<input disabled class='text ui-widget-content ui-corner-all'>");
    var color = $("<input class='jscolor text ui-widget-content ui-corner-all'>");
    name.val(team["name"]);
    color.val(team["color"]);
    $.each([name, color], function(){
        var input_container = $("<div class='two_fields'></div>");
        input_container.append(this);
        container.append(input_container);
    });
    var modify_button = $("<button class='config_modify_btn ui-button ui-corner-all ui-widget'>OK</button>");
    container.append(modify_button);
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

    modify_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/modify_team.php",
            data: {"id": team["id"], "name": name.val(), "color": color.val() },
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["teams"].length; i++){
                        if (config["teams"][i]["id"] === data["id"]){
                            config["teams"][i] = data;
                        }
                    }
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
                       "link": linkify($("#build_station_config_add_link").val()),
                       "color": $("#build_station_config_add_color").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["build_stations"].push(data);
                        add_build_station_to_list(data);
                    }
                    jscolor.installByClassName("jscolor");
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
    var container = $("<div style='width: calc(100% - 13px);float: left;clear: both;'></div>");
    var delete_button = $("<button class='config_delete_btn ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    var name = $("<input disabled class='text ui-widget-content ui-corner-all'>");
    var link = $("<input class='text ui-widget-content ui-corner-all'>");
    var color = $("<input class='jscolor text ui-widget-content ui-corner-all'>");
    name.val(build_station["name"]);
    link.val(build_station["link"]);
    color.val(build_station["color"]);
    $.each([name, link, color], function(){
        var input_container = $("<div class='three_fields'></div>");
        input_container.append(this);
        container.append(input_container);
    });
    var modify_button = $("<button class='config_modify_btn ui-button ui-corner-all ui-widget'>OK</button>");
    container.append(modify_button);
    $("#build_stations_config_list").append(container);
    delete_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/delete_build_station.php",
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
    modify_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/modify_build_station.php",
            data: {"id": build_station["id"], "name": name.val(), "link": linkify(link.val()), "color": color.val() },
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["build_stations"].length; i++){
                        if (config["build_stations"][i]["id"] === data["id"]){
                            config["build_stations"][i] = data;
                        }
                    }
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
                       "framework": $("#exec_machine_config_add_framework").val(),
                       "color": $("#exec_machine_config_add_color").val()},
                success: function (data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config["exec_stations"].push(data);
                        add_exec_station_to_list(data);
                    }
                    jscolor.installByClassName("jscolor");
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
    var container = $("<div style='width: calc(100% - 13px);float: left;clear: both;'></div>");
    var delete_button = $("<button class='config_delete_btn ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);
    var name = $("<input disabled class='text ui-widget-content ui-corner-all'>");
    var framework = $("<input class='text ui-widget-content ui-corner-all'>");
    var location = $("<input class='text ui-widget-content ui-corner-all'>");
    var color = $("<input class='jscolor text ui-widget-content ui-corner-all'>");
    name.val(exec_station["name"]);
    framework.val(exec_station["framework"]);
    location.val(exec_station["location"]);
    color.val(exec_station["color"]);
    $.each([name, framework, location, color], function(){
        var input_container = $("<div class='four_fields'></div>");
        input_container.append(this);
        container.append(input_container);
    });
    var modify_button = $("<button class='config_modify_btn ui-button ui-corner-all ui-widget'>OK</button>");
    container.append(modify_button);

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
    modify_button.click(function(){
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: "/views/config/modify_exec_station.php",
            data: {"id": exec_station["id"], "name": name.val(), "location": location.val(), "framework": framework.val(), "color": color.val() },
            success: function (data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for(var i = 0; i<config["exec_stations"].length; i++){
                        if (config["exec_stations"][i]["id"] === data["id"]){
                            config["exec_stations"][i] = data;
                        }
                    }
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

// authorization

function auth_init(){
    $("#info_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth:400,
        height: 250,
        resizable: false
    });
    $("#auth_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth:300,
        height: 170,
        resizable: false,
        buttons: {
            "Close": function(){
                $(this).dialog("close");
            },
            "Authorize": function(){
                auth($("#password").val());
            }
        }
    });
    $("#open_authorization").click(function(){
        $("#auth_dialog").dialog("open");
    });
    apply_auth_level();
}


function auth(pw){
    block_screen_with_load();
    $("#auth_dialog").dialog("close");
    $.ajax({
        type: "POST",
        url: "/views/auth.php",
        data: {"password": pw},
        success: function (data) {
            if (data["error"] !== undefined) {
                show_error_dialog(data["error"]);
            } else {
                $.cookie("auth_level", data["level"]);
                unblock_screen_with_load();
                apply_auth_level();

                $("#info_dialog").empty();
                if (data["level"]){
                    var stuff_you_can_do;
                    if (data["level"] == 1){
                        stuff_you_can_do = "add/modify/delete projects."
                    } else{
                        stuff_you_can_do = "add/modify/delete projects, add/remove global events, configure the booking system."
                    }
                    $("#info_dialog").append("<div>Gained level " + data["level"] + " rights</div><div>You may now " + stuff_you_can_do +  "</div>")

                } else{
                    $("#info_dialog").append("<div>Invalid password.</div>")
                }
                $("#info_dialog").dialog("open");

            }
        },
        error: function (request, status, error) {
            show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
            console.error(request, status, error);
            unblock_screen_with_load();
        }
    });

}

function apply_auth_level(){
    var level = $.cookie("auth_level");
    if (level === undefined){
        level = 0;
    }
    if (level == 0){
        $("#add_project").addClass("unauthorized");
        $(".project_delete_button").addClass("unauthorized");
        $(".project_save_button").addClass("unauthorized");
    } else{
        $("#add_project").removeClass("unauthorized");
        $(".project_delete_button").removeClass("unauthorized");
        $(".project_save_button").removeClass("unauthorized");
    }
    if (level < 2){
        $("#add_global_event").addClass("unauthorized");
        $("#open_config").addClass("unauthorized");
    } else{
        $("#add_global_event").removeClass("unauthorized");
        $("#open_config").removeClass("unauthorized");
        $("#open_authorization").hide();
    }

}

//


// color coding

function init_color_coding(){
    $("#color_coding_checkbox").prop("checked", $.cookie("color_coding") === "true");
    $("#color_coding_checkbox").checkboxradio({
        icon: false
    });
    $("#color_coding_checkbox").change(function(){
        $.cookie("color_coding", $("#color_coding_checkbox").prop("checked"));
        load_page_structure();
    })
}


function color_code(cell, row){
    switch(chosen_row_type){
        case "Build Machines":
            $.each(config["build_stations"], function(i, bs){
                if (bs["name"] === row){
                    cell.css("background-color", "#" + bs["color"]);
                }
            });
            break;
        case "Execution Machines":
            $.each(config["exec_stations"], function(i, ex){
                if (ex["name"] === row){
                    cell.css("background-color", "#" + ex["color"]);
                }
            });
            break;
        case "ATE operators":
            $.each(config["ate_operators"], function(i, op){
                if (op["name"] === row){
                    cell.css("background-color", "#" + op["color"]);
                }
            });
            break;
        case "Teams":
            $.each(config["teams"], function(i, team){
                if (team["name"] === row){
                    cell.css("background-color", "#" + team["color"]);
                }
            });
            break;
    }

}
//


function config_to_visuals(){
    $("#ate_operators_config_list").empty();
    $("#teams_config_list").empty();
    $("#build_stations_config_list").empty();
    $("#exec_machines_config_list").empty();
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
    jscolor.installByClassName("jscolor");
}