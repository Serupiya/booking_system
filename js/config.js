
function load_config_dialog() {
    $("#config_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 600,
        width: 900,
        height: 600,
        buttons: {
            "Close": function() {
                $(this).dialog("close");
            }
        },

        close: function() {
            block_screen_with_load();
            config_to_visuals();
            load_page_structure();
            unblock_screen_with_load();

        }
    });
    $("#config_tab_switch").tabs();
    $("#open_config").click(function() {
        $("#config_dialog").dialog("open");
        $("#ate_operators_config_list").empty();
        $("#teams_config_list").empty();
        $("#build_stations_config_list").empty();
        $("#maf_config_list").empty();
        $("#exec_machines_config_list").empty();
        $.each(config["build_stations"], function(i, bm) {
            add_build_station_to_list(bm);
        });
        $.each(config["exec_stations"], function(i, ex) {
            add_exec_station_to_list(ex);
        });
        $.each(config["teams"], function(i, team) {
            add_team_to_list(team);
        });
        $.each(config["ate_operators"], function(i, operator) {
            add_ate_operator_to_list(operator);
        });
        $.each(config["maf_stations"], function(i, maf){
            add_maf_station_to_list(maf);
        })
        $(".config_link").each(function(i, link){
            if (!$(link).hasClass("unauthorized")){
                $(link).click();
                return false;
            }
        })
    });
    $("#maf_add_status").selectmenu();

    init_config("ate_operators",
        $("#add_ate_operator_config"),
        {"name": $("#ate_operator_add_name")},
        "views/add_operator.php",
        add_ate_operator_to_list
    );
    init_config("teams",
        $("#add_team_config"),
        {"name": $("#team_config_add_name")},
        "views/add_team.php",
        add_team_to_list
    );
    init_config("build_stations",
        $("#add_build_station_config"),
        {"name": $("#build_station_config_add_name"),
         "link": $("#build_station_config_add_link")},
        "views/add_build_station.php",
        add_build_station_to_list
    );
    init_config("exec_stations",
        $("#add_exec_machine_config"),
        {"name": $("#exec_machine_config_add_name"),
        "location": $("#exec_machine_config_add_location"),
        "framework": $("#exec_machine_config_add_framework")},
        "views/add_exec_station.php",
        add_exec_station_to_list
    );
    init_config("maf_stations",
        $("#add_maf_config"),
        {"name": $("#maf_add_name"),
         "ip": $("#maf_add_ip"),
         "status": $("#maf_add_status"),
         "comment": $("#maf_add_comment")},
        "views/add_maf_station.php",
        add_maf_station_to_list
    );

}


function init_config(config_name,
                     button_selector,
                     field_dict,
                     add_url,
                     add_function){

    button_selector.click(function() {
        var all_filled = true;
        var field_values = {};
        $.each(field_dict, function(field_name, field){
            var field_value = field.val();
            if (field_value == "" && !field.hasClass("not-required")){
                all_filled = false;
            }
            if (field_name == "link"){
                field_value = linkify(field_value);
            }
            field_values[field_name] = field_value;
        });
        if (!all_filled){
            var validation_error_div = $("#validation_error_msg");
            validation_error_div.empty();
            validation_error_div.append("<p>You must fill out all fields</p>");
            validation_error_div.dialog("open");
        } else{
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: add_url,
                data: field_values,
                success: function(data) {
                    console.log(data);
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        config[config_name].push(data);
                        add_function(data);
                    }
                    unblock_screen_with_load();

                },
                error: function(request, status, error) {
                    show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                    console.error(request, status, error);
                    unblock_screen_with_load();
                }
            });
        }


    });
}

function add_to_list(data, row_container_div, delete_url, modify_url, config_name, specials){
    var container = $("<div style='width: calc(100% - 13px);float: left;clear: both;'></div>");
    row_container_div.append(container);
    var delete_button = $("<button class='config_delete_btn ui-button ui-corner-all ui-widget'>X</button>");
    container.append(delete_button);

    var field_count = 0;
    $.each(data, function(){
        field_count++;
    });

    var field_class = ["one_field", "two_fields", "three_fields", "four_fields"][field_count - 2];  // currently not expecting more fields than 4
    var data_links = {};
    var is_first = true;
    $.each(data, function(field_name, value){
        if (field_name != "id"){
            var input_container = $("<div class='" + field_class + "'></div>");
            var input_element;
            if (specials && field_name in specials){
                if (specials[field_name]["selectmenu"]){
                    input_element = $("<select style='position:relative;z-index:120'></select>");
                    $.each(specials[field_name]["selectmenu"], function(opt_value, opt_shown_value){
                        input_element.append("<option value='" + opt_value + "'>" + opt_shown_value + "</option>");
                    });
                    input_container.append(input_element);
                    container.append(input_container);
                    input_element.val(value);
                    if (specials[field_name]["colors"]){
                        input_element.selectmenu({
                            change: function(e, item){
                                var widget = $(this).selectmenu("instance");
                                $(widget.button).css("background-color", specials[field_name]["colors"][item.item.value])
                            }
                        });
                        var widget = input_element.selectmenu("instance");
                        $(widget.button).css("background-color", specials[field_name]["colors"][value])
                    }
                }
            } else{
                input_element =  $("<input class='text ui-widget-content ui-corner-all'>");
                input_element.val(value);
                if (is_first){
                    is_first = false;
                    input_element.prop('disabled', true);
                }
                input_container.append(input_element);
                container.append(input_container);
            }
            data_links[field_name] = input_element;
        }
    });

    var modify_button = $("<button class='config_modify_btn ui-button ui-corner-all ui-widget'>OK</button>");
    container.append(modify_button);


    delete_button.click(function() {
        block_screen_with_load();
        $.ajax({
            type: "POST",
            url: delete_url,
            data: {
                "id": data["id"]
            },
            success: function(data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for (var i = 0; i < config[config_name].length; i++) {
                        if (config[config_name][i]["id"] === data["id"]) {
                            config[config_name].splice(i, 1);
                        }
                    }
                    container.remove();
                }

                unblock_screen_with_load();

            },
            error: function(request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
    modify_button.click(function() {
        block_screen_with_load();
        var ajax_data = {id: data["id"]};
        $.each(data_links, function(field_name, field_element){
            ajax_data[field_name] = field_element.val();
            if (field_name == "link"){
                ajax_data[field_name] = linkify(ajax_data[field_name]);
            }
        });
        $.ajax({
            type: "POST",
            url: modify_url,
            data: ajax_data,
            success: function(data) {
                if (data["error"] !== undefined) {
                    show_error_dialog(data["error"]);
                } else {
                    for (var i = 0; i < config[config_name].length; i++) {
                        if (config[config_name][i]["id"] === data["id"]) {
                            config[config_name][i] = data;
                        }
                    }
                }
                unblock_screen_with_load();

            },
            error: function(request, status, error) {
                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                console.error(request, status, error);
                unblock_screen_with_load();
            }
        });
    });
}


function add_ate_operator_to_list(operator){
    add_to_list(
        operator,
        $("#ate_operators_config_list"),
        "views/delete_operator.php",
        "views/modify_operator.php",
        "ate_operators"
    );
}

function add_team_to_list(team){
    add_to_list(
        team,
        $("#teams_config_list"),
        "views/delete_team.php",
        "views/modify_team.php",
        "teams"
    );
}

function add_build_station_to_list(build_station){
    add_to_list(
        build_station,
        $("#build_stations_config_list"),
        "views/delete_build_station.php",
        "views/modify_build_station.php",
        "build_stations"
    );
}

function add_exec_station_to_list(exec_station){
    add_to_list(
        exec_station,
        $("#exec_machines_config_list"),
        "views/delete_exec_station.php",
        "views/modify_exec_station.php",
        "exec_stations"
    );
}

function add_maf_station_to_list(maf_station){
    add_to_list(
        maf_station,
        $("#maf_config_list"),
        "views/delete_maf_station.php",
        "views/modify_maf_station.php",
        "maf_stations",
        {"status":
            {
                "selectmenu": {"running": "RUNNING", "malfunction": "MALFUNCTION", "borrowed": "BORROWED"},
                "colors": {"running": "#ADFF2F", "malfunction": "#FF6347", "borrowed": "#87CEEB"}
        }}
    );
}



// authorization

function auth_init() {
    $("#info_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 400,
        height: 250,
        resizable: false
    });
    $("#auth_dialog").dialog({
        autoOpen: false,
        modal: true,
        minWidth: 300,
        height: 170,
        resizable: false,
        buttons: {
            "Close": function() {
                $(this).dialog("close");
            },
            "Authorize": function() {
                auth($("#password").val());
            }
        }
    });
    $("#open_authorization").click(function() {
        $("#auth_dialog").dialog("open");
    });
    apply_auth_level();
}


function auth(pw) {
    block_screen_with_load();
    $("#auth_dialog").dialog("close");
    $.ajax({
        type: "POST",
        url: "views/auth.php",
        data: {
            "password": pw
        },
        success: function(data) {
            if (data["error"] !== undefined) {
                show_error_dialog(data["error"]);
            } else {
                $.cookie("auth_level", data["level"]);
                unblock_screen_with_load();
                apply_auth_level();

                $("#info_dialog").empty();
                if (data["level"]) {
                    var stuff_you_can_do;
                    if (data["level"] == 1) {
                        stuff_you_can_do = "add/modify/delete projects."
                    } else {
                        stuff_you_can_do = "add/modify/delete projects, add/remove global events, configure the booking system."
                    }
                    $("#info_dialog").append("<div>Gained level " + data["level"] + " rights</div><div>You may now " + stuff_you_can_do + "</div>")

                } else {
                    $("#info_dialog").append("<div>Invalid password.</div>")
                }
                $("#info_dialog").dialog("open");

            }
        },
        error: function(request, status, error) {
            show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
            console.error(request, status, error);
            unblock_screen_with_load();
        }
    });

}

function apply_auth_level() {
    var level = $.cookie("auth_level");
    if (level === undefined) {
        level = 0;
    }
    level = Number(level);

    $("#add_project").addClass("unauthorized");
    $(".project_delete_button").addClass("unauthorized");
    $(".project_save_button").addClass("unauthorized");
    $("#add_global_event").addClass("unauthorized");
    $("#open_config").addClass("unauthorized");
    $(".main_config").addClass("unauthorized");

    // Normal user level 1
    if (level >= 1) {
        $("#add_project").removeClass("unauthorized");
        $(".project_delete_button").removeClass("unauthorized");
        $(".project_save_button").removeClass("unauthorized");

    }

    // Admin level 2
    if (level == 2){
        $("#add_global_event").removeClass("unauthorized");
        $(".main_config").removeClass("unauthorized");
        $("#open_authorization").hide();
    }

    // MAF config level 3
    if (level >= 2){
        $("#open_config").removeClass("unauthorized");
    }
}

//


function config_to_visuals() {

    build_machines = [];
    exec_machines = [];
    ate_operators = [];
    teams = [];
    maf_stations = [];
    exec_machine_frameworks = {};
    exec_locations = {};
    build_machine_links = {};
    $.each(config["build_stations"], function(i, bm) {
        //add_build_station_to_list(bm);
        build_machines.push(bm["name"]);
        build_machine_links[bm["name"]] = bm["link"];
    });
    if (build_machines.indexOf("TBD") === -1) {
        build_machines.push("TBD");
    }
    $.each(config["exec_stations"], function(i, ex) {
        //add_exec_station_to_list(ex);
        exec_machines.push(ex["name"]);
        if (exec_locations[ex["location"]] === undefined) {
            exec_locations[ex["location"]] = [ex["name"]];
        } else {
            exec_locations[ex["location"]].push(ex["name"]);
        }
        if (exec_machine_frameworks[ex["framework"]] === undefined) {
            exec_machine_frameworks[ex["framework"]] = [ex["name"]];
        } else {
            exec_machine_frameworks[ex["framework"]].push(ex["name"]);
        }

    });
    if (exec_machines.indexOf("TBD") === -1) {
        exec_machines.push("TBD");
    }
    $.each(config["teams"], function(i, team) {
        //add_team_to_list(team);
        teams.push(team["name"]);
    });
    $.each(config["ate_operators"], function(i, operator) {
        //add_ate_operator_to_list(operator);
        ate_operators.push(operator["name"]);
    });
    $.each(config["maf_stations"], function(i, maf){
        //add_maf_station_to_list(maf);
        maf_stations.push(maf["name"]);
    })
}