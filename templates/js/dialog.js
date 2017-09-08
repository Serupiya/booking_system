var checkbox_names = [
    "wiring_designed",
    "wiring_implemented",
    "af_created",
    "sw_installed",
    "licenses",
    "af_configured",
    "af_config_reviewed",
    "source_code_loaded",
    "exec_success",
    "wiring_pass"
];

function load_reserve_dialog(){
    reserve_dialog = $( "#reserve_dialog" ).dialog({
        autoOpen: false,
        height: 600,
        width: 750,
        minWidth: 700,
        modal: true,
        buttons: {
            "Save": function(){

                var validated = validate_form();
                if (validated){
                    var active = main_tabs.tabs("option", "active");
                    var project = {};
                    if (active === 0){
                        project["name"] = project_name_input.val();
                    } else{
                        project["name"] = project_edit_name_select.val();
                    }

                    project["start_date"] = start_date_input.val();
                    project["end_date"] = end_date_input.val();
                    project["ate_operator"] = project_leader_select.val();
                    project["team"] = team_select.val();
                    project["derivatives"] = [];
                    $(".derivative").each(function(){
                        var derivative_info = {};
                        derivative_info["name"] = $(this).find(".derivative_name").val();
                        derivative_info["exec_station"] = $(this).find(".exec_station").val();
                        derivative_info["build_station"] = $(this).find(".build_station").val();
                        derivative_info["link"] = $(this).find(".link_span").text();
                        derivative_info["progress"] = {};
                        $(this).find(".progress_checkboxes").children().each(function(i, checkbox){
                            derivative_info["progress"][$(checkbox).attr("name")] = Number($(checkbox).prop("checked"));
                        });
                        project["derivatives"].push(derivative_info);
                    });
                    project["quality_pack_stations"] = [];
                    $(".quality_pack_select").each(function(){
                        project["quality_pack_stations"].push($(this).val());
                    });
                    project["framework"] = project_framework.val();
                    project["sw_versions"] = sw_versions.val();
                    project["hw_versions"] = hw_versions.val();
                    project["additional_info"] = additional_info.val();
                    project["setup_milestone"] = $("#setup_milestone").val();


                    project["links"] = [];
                    $("#links").find("a.link").each(function(){
                        project["links"].push({"link": $(this).attr("href"), "description": $(this).text()});
                    });

                    console.log(project);
                    block_screen_with_load();
                    $.ajax({
                        type: "POST",
                        url: active === 0?"/views/add_project.php":"/views/modify_project.php",
                        data: project,
                        success: function(data){
                            console.log(data);
                            if (data["error"] !== undefined){
                                show_error_dialog(data["error"]);
                            } else{
                                if (active == 0){
                                    projects.push(data);
                                } else{
                                    $.each(projects, function(i, p) {
                                        if (project["name"] === p["name"]) {
                                            projects[i] = project;
                                        }
                                    });
                                }
                                try{
                                    create_table(chosen_row_type);
                                }
                                catch(err){
                                    show_error_dialog("Cannot recreate booking system structure after data was received.");
                                    console.error(err);
                                    console.error(data);
                                }
                                reserve_dialog.dialog("close");
                            }
                            unblock_screen_with_load();
                        },
                        error: function (request, status, error) {
                            show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                            console.error(request, status, error);
                            unblock_screen_with_load();
                        }
                    });

                   //console.log(JSON.stringify(project));

                }
            },
            "Delete":{
                class: 'project_delete_button',
                text: 'Delete',
                click : function (){
                    $("#deleted_project_name").text(project_edit_name_select.val());
                    $("#delete_confirmation_dialog").dialog("open");
                }
            },
            "Cancel": function() {
                reserve_dialog.dialog( "close" );
            }
        },
        open: function(){

            project_edit_name_select.empty();
            $.each(projects, function(i, project){
                project_edit_name_select.append("<option value='" + project["name"] + "'>" + project["name"] + "</option>");
            });
            project_edit_name_select.selectmenu("refresh");

            project_name_select.empty();
            $.each(projects, function(i, project){
                project_name_select.append("<option value='" + project["name"] + "'>" + project["name"] + "</option>");
            });
            project_name_select.selectmenu("refresh");

            project_leader_select.empty();
            $.each(ate_operators, function(i, operator){
                project_leader_select.append("<option value='" + operator + "'>" + operator + "</option>");
            });
            project_leader_select.selectmenu("refresh");

            team_select.empty();
            $.each(teams, function(i, team){
                team_select.append("<option value='" + team + "'>" + team + "</option>");
            });

            project_framework.empty();
            for (var key in exec_machine_frameworks){
                project_framework.append("<option value='" + key + "'>" + key + "</option>");
            }

            project_framework.selectmenu("refresh");
            team_select.selectmenu("refresh");
            main_tabs.tabs("refresh");

        },
        close: function() {
            clear_fields();

        }
    });

    activate_derivative_add_button();

    $("#add_link").click(function(){
        var link = $("#link_input")
        var description = $("#link_description")
        var links_div = $("#links");
        if (link.val() !== "" && description.val() !== ""){
            var container_div = $("<div></div>");
            var link_div = $("<div style='float:left;'><a href='" + linkify(link.val()) + "' target=_blank'>" + description.val() + "</a></div>");
            container_div.append(link_div);
            var delete_link = $("<a style='margin-left:5px; color:red; float:left; display:inline-block'>X</a>");
            container_div.append(delete_link);
            container_div.append("<br>");
            delete_link.click(function(){
                container_div.remove();
            });
            links_div.append(container_div);
            link.val("");
            description.val("");
        }
    });


    $("#ate_milestone_dialog").dialog({
        height: 460,
        width: 550,
        resizable: false,
        autoOpen: false,
        modal: true,
        buttons: {
            "Ok": function(){
                var progress = 0;
                currently_edited_ate_milestone.children().each(function(i, checkbox){
                    $(checkbox).prop("checked", $("#" + $(checkbox).attr("name")).prop("checked"));
                    progress += Number($(checkbox).prop("checked")) * 10;
                });
                currently_edited_ate_milestone.parent().find(".progressbar").progressbar("value", progress);
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        },
        open: function() {
            currently_edited_ate_milestone.children().each(function(i, checkbox){
                var dialog_cb = $("#" +  $(checkbox).attr("name"));
                dialog_cb.prop("checked", $(checkbox).prop("checked"));
                dialog_cb.button("refresh");
            });

        }
    });

    $(".checkbox").checkboxradio({
        icon: false
    });
    $("#delete_confirmation_dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Delete": function(){
                block_screen_with_load();
                $.ajax({
                    type: "POST",
                    url: "/views/delete_project.php",
                    data: {"name": $("#deleted_project_name").text()},
                    success: function (data) {
                        if (data["error"] !== undefined) {
                            show_error_dialog(data["error"]);
                        } else{
                            for (var i = 0; i<projects.length; i++){
                                if (projects[i]["name"] === project_edit_name_select.val()) {
                                    projects.splice(i, 1);
                                    create_table(chosen_row_type);
                                    break;
                                }
                            }
                        }
                        $("#delete_confirmation_dialog").dialog("close");
                        unblock_screen_with_load();
                    },
                    error: function (request, status, error) {
                        show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                        console.error(request, status, error);
                        $("#delete_confirmation_dialog").dialog("close");
                        unblock_screen_with_load();
                    }
                });

            },
            "Cancel": function(){
                $(this).dialog("close");
            }
        }
    });
    $("#validation_error_msg").dialog({autoOpen: false, modal: true});
    $("#error_msg_dialog").dialog({autoOpen: false, modal: true});
    $("#change_link_dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Ok": function(){
                currently_edited_link.text(linkify($("#new_link").val()));
                $(this).dialog( "close" );
            },
            "Cancel": function() {
                $(this).dialog( "close" );
            }
        },
        open: function(){
            $("#new_link").val(currently_edited_link.text());
        }
    });


    project_edit_name_select.selectmenu({
        "change": function(){
            choose_project_to_edit();
        }
    });



    project_framework.selectmenu({
        "change": function(){
            var active_tab = main_tabs.tabs("option", "active");
            if (active_tab === 1){
                on_date_change(start_date_input, end_date_input, project_edit_name_select.val());
            }
            else{
                on_date_change(start_date_input, end_date_input);
            }
        }
    });
    project_name_select.selectmenu();
    project_leader_select.selectmenu();
    team_select.selectmenu();
    $("#setup_milestone").datepicker()
    start_date_input.datepicker({
        "onSelect": function(){
            var active_tab = main_tabs.tabs("option", "active");
            if (active_tab === 1){
                on_date_change(start_date_input, end_date_input, project_edit_name_select.val());
            }
            else{
                on_date_change(start_date_input, end_date_input);
            }
        }
    });
    end_date_input.datepicker({
        "onSelect": function(){
            var active_tab = main_tabs.tabs("option", "active");
            if (active_tab === 1){
                on_date_change(start_date_input, end_date_input, project_edit_name_select.val());
            }
            else{
                on_date_change(start_date_input, end_date_input);
            }
        }
    });

    $("#add_quality_pack").click(function(){
        var qp_container = $(".quality_pack_stations");
        var select_container = $("<div style='width: 80%;float:left'></div>");
        var delete_button = $("<button class='ui-button ui-corner-all ui-widget' style=\"color:red;width:15%;float:left;margin-left: 22px;padding:6px 0 6px 0;\">X</button>");
        var new_station_select = $("<select class='quality_pack_select'></select>");
        var active_tab = main_tabs.tabs("option", "active");
        var viable_machines;
        if (check_start_end_time(start_date_input.val(), end_date_input.val())) {
            if (active_tab === 1) {
                viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                    formated_to_date_array(end_date_input.val()), project_edit_name_select.val());
            } else {
                viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                    formated_to_date_array(end_date_input.val()));
            }

            $.each(viable_machines["used_build_machines"], function (i, machine) {
                new_station_select.append("<option value='" + machine + "'>" + machine + " (USED)</option>");
            });
            $.each(viable_machines["build_machines"], function (i, machine) {
                new_station_select.append("<option value='" + machine + "'>" + machine + "</option>");
            });

        } else{
            new_station_select.append("<option value='TBD'>Set a correct date first</option>");
            new_station_select.append("<option value='TBD'>Set a correct date first</option>");
        }
        select_container.append(new_station_select);
        qp_container.append(select_container);
        qp_container.append(delete_button);
        new_station_select.selectmenu();
        new_station_select.val("TBD");
        new_station_select.selectmenu("refresh");
        delete_button.click(function () {
            delete_button.remove();
            select_container.remove();
        })


    });

    main_tabs.tabs({
        activate: function(event ,ui){
            var active = main_tabs.tabs("option", "active");
            if (active === 0){
                clear_fields();
                $("#reserve_edit_div").hide();
                $("#reserve_create_div").show();
                $(".project_delete_button").hide();
            } else if (active === 1){
                clear_fields();
                choose_project_to_edit();
                $("#reserve_edit_div").show();
                $("#reserve_create_div").hide();
                $(".project_delete_button").show();
            }
        }
    });

    $("#add_project").click(function(){
        reserve_dialog.dialog("open");
        $("#reserve_edit_div").hide();
        $("#reserve_create_div").show();
        $(".project_delete_button").hide();
        main_tabs.tabs( "option", "active", 0 );
    })

}


function validate_form(){
    var active = main_tabs.tabs("option", "active");
    var messages_div = $("<div></div>");
    var valid = true;
    if (start_date_input.val() === ""){
        valid = false;
        messages_div.append($("<span>Start date needs to be filled out!</span><br>"));
    }
    if (end_date_input.val() === ""){
        valid = false;
        messages_div.append($("<span>End date needs to be filled out!</span><br>"));
    }
    if (valid && !check_start_end_time(start_date_input.val(), end_date_input.val())){
        valid = false;
        messages_div.append($("<span>Start date should be before the end date!</span><br>"));
    }
    if (active === 0 && project_name_input.val() === ""){
        valid = false;
        messages_div.append($("<span>Project name needs to be filled out!</span><br>"));
    }
    else if (active === 0){
        $.each(projects, function(i, project){
            if (project["name"] == project_name_input.val()){
                valid = false;
                messages_div.append($("<span>A project with this name already exists!</span><br>"));
            }
        })
    }
    if (!valid){
        $("#validation_error_msg").empty();
        $("#validation_error_msg").append(messages_div);
        $("#validation_error_msg").dialog("open");
    }
    return valid;
}

function activate_derivative_add_button(){

    $("#reserve_add_derivative_btn").click(function(){
        var derivative = reserve_derivative.val();
        if (derivative !== ""){
            //var link = $("<a href='#" + "derivative_tab-" + derivative + "'></a>");

            var container_div = $("<div class='derivative'></div>");

            var container_for_name_and_buttons = $("<div class='derivative_name_container'></div>");
            var deriv_name = $("<input style='width:60%; float:left' class='derivative_name text ui-widget-content ui-corner-all' class='text ui-widget-content ui-corner-all'>");
            var delete_button = $("<button class='ui-button ui-corner-all ui-widget' style='color:red;width:15%;float:left;margin-right: 5px'>X</button>");
            var go_to_button = $("<button class='ui-button ui-corner-all ui-widget' style='width:5%;float:left; height: 100%'>></button>");

            var gotobtn_div = $("<div style='display:inline-block; height: 53px'></div>");
            var link_span = $("<span class='link_span' style='display:none'></span>");
            container_for_name_and_buttons.append(delete_button);
            container_for_name_and_buttons.append(deriv_name);
            container_div.append(container_for_name_and_buttons);
            //link.append(deriv_name);
            //link.append(delete_button);
            deriv_name.val(derivative);

            //var li_encapsulation = $("<li></li>");
            //li_encapsulation.append(link);
            reserve_derivative_div.append(container_div);

            var build_station = $("<select style='position:relative;z-index:120' class='build_station'></select>");
            var exec_station = $("<select style='position:relative;z-index:120' class='exec_station'></select>");

            delete_button.click(function(){
                container_div.remove();
            });
            go_to_button.click(function(){
                window.open(link_span.text(),'_blank');
            });
            go_to_button.contextmenu(function(e){
                e.preventDefault();
                currently_edited_link = link_span;
                $("#change_link_dialog").dialog("open");
            });


            if (check_start_end_time(start_date_input.val(), end_date_input.val())){
                var active_tab = main_tabs.tabs("option", "active");
                if (active_tab === 1) {
                    var viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                        formated_to_date_array(end_date_input.val()), project_edit_name_select.val());
                } else{
                    var viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                        formated_to_date_array(end_date_input.val()));
                }

                $.each(viable_machines["used_build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + " (USED)</option>");
                });
                $.each(viable_machines["build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + "</option>");
                });
                $.each(viable_machines["exec_machines"], function(i, machine){
                    if (machine !== "TBD" ){
                        var exec_location;
                        for (var location in exec_locations){
                            if (exec_locations.hasOwnProperty(location) && exec_locations[location].indexOf(machine) !== -1){
                                exec_location = location;
                                break;
                            }
                        }

                        exec_station.append("<option value='" + machine + "'>" + machine + " (" + exec_location + ")" +  "</option>");
                    } else{
                        exec_station.append("<option value='" + machine + "'>" + machine + "</option>");
                    }
                });
            } else{
                build_station.append("<option value='TBD'>Set a correct date first</option>");
                exec_station.append("<option value='TBD'>Set a correct date first</option>");
            }
            /*
            $.each(build_machines, function(i, machine){
                build_station.append("<option value='" + machine + "'>" + machine + "</option>");
            });

            $.each(exec_machines, function(i, machine){
                exec_station.append("<option value='" + machine + "'>" + machine + "</option>");
            });*/
            var bs_container = $("<div style='width:45%;float:left'></div>");
            bs_container.append(build_station);
            var ex_container = $("<div style='width:45%;float:left;'></div>");
            ex_container.append(exec_station);


            var ex_and_bs_container = $("<div></div>");
            ex_and_bs_container.append(bs_container);
            ex_and_bs_container.append($("<div style='width:8%;display:inline-block;height: 1px;float:left'></div>"));
            ex_and_bs_container.append(ex_container);


            var progress_container = $("<div class='progress_container' style='width:calc(100% + 8px); float:left'></div>");
            var progress_visual = $("<div class='progressbar' style='float:left;width:100%'></div>") ;
            var progress_visual_label = $("<div class='progress-label'>0</div>");
            //var progress_date_limit = $("<input style='width:45%;float:left' type='text' readonly='true' class='text ui-widget-content ui-corner-all'>");
            var progress_checkbox_info_container = $("<div class='progress_checkboxes' style='display:none'></div>");


            for (var i = 0; i<checkbox_names.length; i++){
                var checkbox = $("<input type='checkbox' name='" + checkbox_names[i] + "'>");
                progress_checkbox_info_container.append(checkbox);
            }
            progress_visual.append(progress_visual_label);
            progress_visual.click(function(e){
                e.preventDefault();
                currently_edited_ate_milestone = progress_checkbox_info_container;
                $("#ate_milestone_dialog").dialog("open");

            });
           // progress_container.append(progress_date_limit);
           // progress_container.append($("<div style='width:8%;display:inline-block;height: 1px;float:left'></div>"));
            progress_container.append(progress_visual);
            progress_container.append(progress_checkbox_info_container);
            progress_visual.progressbar({
                value: "0",
                change: function() {
                    progress_visual_label.text(progress_visual.progressbar("value") + "%");
                },
                complete: function() {
                    progress_visual_label.text("DONE");
                }
            });

            var derivative_content_container = $("<div class='derivative_content_container'></div>");
            derivative_content_container.append(ex_and_bs_container);
            derivative_content_container.append(progress_container);
            container_div.append(derivative_content_container);



            container_div.append($("<div style='width:4%;display:inline-block;height: 1px;float:left'></div>"));
            gotobtn_div.append(go_to_button);
            container_div.append(gotobtn_div);
            container_div.append(link_span);

            build_station.selectmenu({
                "change": function(){
                    link_span.text(build_machine_links[build_station.val()]);
                }
            });
            build_station.val("TBD");
            build_station.selectmenu("refresh");
            exec_station.selectmenu();
            exec_station.val("TBD");
            exec_station.selectmenu("refresh");


            reserve_derivative.val("");
        }
    });

}


function choose_project_to_edit(){

    var project;
    clear_fields();
    if (projects.length > 0){
        $.each(projects, function(i, p){
            if (p["name"] === project_edit_name_select.val()){
                project = p;
            }
        });

        project_leader_select.find("option[value='" + project["ate_operator"] + "']").attr("selected", true);
        project_leader_select.selectmenu("refresh");

        team_select.find("option[value='" + project["team"] + "']").attr("selected", true);
        team_select.selectmenu("refresh");

        start_date_input.val("");
        end_date_input.val("");
        $(".derivative").remove();
        $("#reserve_derivative_links").find("li").remove();

        project_framework.find("option[value='" + project["framework"] + "']").attr("selected", true);
        project_framework.selectmenu("refresh");

        $("#setup_milestone").val(project["setup_milestone"]);
        start_date_input.val(project["start_date"]);
        end_date_input.val(project["end_date"]);

        sw_versions.val(project["sw_versions"]);
        hw_versions.val(project["hw_versions"]);
        additional_info.val(project["additional_info"]);

        var machines_linked = [];
        $.each(project["derivatives"], function(i, derivative) {
            $("#reserve_derivative").val(derivative["name"]);
            $("#reserve_add_derivative_btn").click();
            var tab = $(".derivative").last();
            var build_station = tab.find(".build_station");
            var exec_station = tab.find(".exec_station");
            tab.find(".link_span").text(derivative["link"]);
            build_station.val(derivative["build_station"]);
            build_station.selectmenu("refresh");
            exec_station.val(derivative["exec_station"]);
            exec_station.selectmenu("refresh");
            var progress = 0;
            tab.find(".progress_checkboxes").children().each(function(i, checkbox){
                var checked = Number(derivative["progress"][$(checkbox).attr("name")]);
               $(checkbox).prop("checked", checked);
                progress += 10*checked;
            });
            tab.find(".progressbar").progressbar("value", progress);
        });
        $.each(project["quality_pack_stations"], function(i, station){
            $("#add_quality_pack").click();
            $(".quality_pack_select").last().val(station);
            $(".quality_pack_select").last().selectmenu("refresh");

        });
        $.each(project["links"], function(i, link){
            var container_div = $("<div></div>");
            var link_div = $("<div class='link' style='float:left;'><a class='link' href='" + link["link"] + "' target=_blank'>" + link["description"] + "</a></div>");
            container_div.append(link_div);
            var delete_link = $("<a style='margin-left:5px; color:red; float:left; display:inline-block'>X</a>");
            container_div.append(delete_link);
            container_div.append("<br>");
            delete_link.click(function(){
                container_div.remove();
            });
            $("#links").append(container_div);
        });
    }

}

function clear_fields(){
    start_date_input.val("");
    end_date_input.val("");
    $(".derivative").remove();
    reserve_derivative_div.empty();
    $(".quality_pack_stations").empty();
    sw_versions.val("");
    hw_versions.val("");
    additional_info.val("");
    $("#links").empty();
    $("#link_description").val("");
    $("#link_input").val("");
    $("#bs_links").empty();
}



function on_date_change(start_date_input, end_date_input, own_project){
    {
        if (check_start_end_time(start_date_input.val(), end_date_input.val())){
            var active_tab = main_tabs.tabs("option", "active");
            var viable_machines;
            if (active_tab === 1) {
                viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                    formated_to_date_array(end_date_input.val()), project_edit_name_select.val());
            } else{
                viable_machines = get_possible_reservation_slots(formated_to_date_array(start_date_input.val()),
                    formated_to_date_array(end_date_input.val()));
            }

            $(".quality_pack_select").each(function(i, build_station){
                build_station = $(build_station);
                build_station.empty();
                $.each(viable_machines["used_build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + " (USED)</option>");
                });
                $.each(viable_machines["build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + "</option>");
                });
                build_station.val("TBD");
                build_station.selectmenu("refresh");
            });


            $(".build_station").each(function(i, build_station){
                build_station = $(build_station);
                build_station.empty();
                $.each(viable_machines["used_build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + " (USED)</option>");
                });
                $.each(viable_machines["build_machines"], function(i, machine){
                    build_station.append("<option value='" + machine + "'>" + machine + "</option>");
                });
                build_station.val("TBD");
                build_station.selectmenu("refresh");
            });
            $(".exec_station").each(function(i, exec_station){
                exec_station = $(exec_station);
                exec_station.empty();
                $.each(viable_machines["exec_machines"], function(i, machine){
                    if (machine !== "TBD" ){
                        var exec_location;
                        for (var location in exec_locations){
                            if (exec_locations.hasOwnProperty(location) && exec_locations[location].indexOf(machine) !== -1){
                                exec_location = location;
                                break;
                            }
                        }

                        exec_station.append("<option value='" + machine + "'>" + machine + " (" + exec_location + ")" +  "</option>");
                    } else{
                        exec_station.append("<option value='" + machine + "'>" + machine + "</option>");
                    }
                });
                exec_station.val("TBD");
                exec_station.selectmenu("refresh");
            });

        } else{

            $(".quality_pack_select").each(function(i, build_station){
                build_station = $(build_station);
                build_station.empty();
                build_station.append("<option value='TBD'>Set a correct date first</option>");
                build_station.val("TBD");
                build_station.selectmenu("refresh");
            });

            $(".build_station").each(function(i, build_station){
                build_station = $(build_station);
                build_station.empty();
                build_station.append("<option value='TBD'>Set a correct date first</option>");
                build_station.val("TBD");
                build_station.selectmenu("refresh");
            });
            $(".exec_station").each(function(i, exec_station){
                exec_station = $(exec_station);
                exec_station.empty();
                exec_station.append("<option value='TBD'>Set a correct date first</option>");
                exec_station.val("TBD");
                exec_station.selectmenu("refresh");
            });
        }
    }
}


function load_global_event_dialog(){
    var global_event_dialog = $("#global_reserve_dialog");
    var event_start = $("#event_start_date");
    var event_end = $("#event_end_date");
    global_event_dialog.dialog({
        autoOpen: false,
        height: 600,
        width: 550,
        modal: true,
        buttons: {
            "Save": {
                class: "global_event_save_btn",
                text: "Save",
                click: function(){
                    /*
                     global_events.push({
                     "name": $("#event_name").val(),
                     "start": event_start.val(),
                     "end": event_end.val()
                     });
                     global_event_dialog.dialog("close");
                     create_table(chosen_row_type);
                     */
                    var messages_div = $("<div></div>");

                    if ($("#event_name").val() === ""){
                        messages_div.append("<p>The event name needs to be filled out</p>");
                    }
                    if (event_start.val() === ""){
                        messages_div.append("<p>The event start date needs to be filled out</p>");
                    }
                    if (event_end.val() === ""){
                        messages_div.append("<p>The event end date needs to be filled out</p>");
                    }

                    if (messages_div.text() !== ""){
                        $("#validation_error_msg").empty();
                        $("#validation_error_msg").append(messages_div);
                        $("#validation_error_msg").dialog("open");
                    } else{

                        var event = {
                            "name": $("#event_name").val(),
                            "start": event_start.val(),
                            "end": event_end.val()
                        };
                        block_screen_with_load();
                        $.ajax({
                            type: "POST",
                            url: "/views/add_global_event.php",
                            data: event,
                            success: function (data) {
                                if (data["error"] !== undefined) {
                                    show_error_dialog(data["error"]);
                                } else {
                                    global_events.push(data);
                                    try {
                                        create_table(chosen_row_type);
                                    } catch (err) {
                                        show_error_dialog("Cannot recreate booking system structure after data was received.");
                                        console.error(err);
                                        console.error(data);
                                    }
                                }
                                global_event_dialog.dialog("close");
                                unblock_screen_with_load();

                            },
                            error: function (request, status, error) {
                                show_error_dialog("Server either didn't respond or didn't send a JSON response (" + error + ")");
                                console.error(request, status, error);
                                unblock_screen_with_load();
                            }
                        });
                    }
                }
            },
            "Cancel": function(){
                global_event_dialog.dialog("close");
            }
        }
    });


    $("#global_reserve_dialog").tabs({
        activate: function(event ,ui) {
            var active = $(this).tabs("option", "active");
            if (active === 1) {
                $(".global_event_save_btn").hide();
                reload_view_global_events()
            } else if (active === 0){
                $("#event_name").val("");
                event_start.val("");
                event_end.val("");
                $(".global_event_save_btn").show();
            }
        }

    });

    $("#add_global_event").click(function(){
        global_event_dialog.dialog("open");
        $(".global_event_save_btn").show();
        $("#global_reserve_dialog").tabs( "option", "active", 0 );
    });
    event_start.datepicker();
    event_end.datepicker();

}

function reload_view_global_events(){
    var event_container = $("#view_global_events_tab");
    event_container.empty();
    $.each(global_events, function(i, event){
        var container = $("<div></div>");
        container.append("<div style='width:45%; display:inline-block'><span>" + event["name"] + "</span></div>");
        container.append("<div style='width:45%; display:inline-block'><span>" + event["start"] + " - "  + event["end"] + "</span></div>");
        var delete_button = $("<button class='ui-button ui-corner-all ui-widget'>X</button>");
        var delete_btn_container = $("<div style='width:10%;display:inline-block'></div>");
        delete_btn_container.append(delete_button);
        container.append(delete_btn_container);
        delete_button.click(function(){
            block_screen_with_load();
            $.ajax({
                type: "POST",
                url: "/views/delete_global_event.php",
                data: {"id": event["id"]},
                success: function (data) {
                    if (data["error"] !== undefined) {
                        show_error_dialog(data["error"]);
                    } else {
                        for (var i = 0; i<global_events.length; i++){
                            if (global_events[i]["id"] == data["id"]){
                                global_events.splice(i, 1);
                                break;
                            }
                        }
                        try {
                            create_table(chosen_row_type);
                            reload_view_global_events();
                        } catch (err) {
                            show_error_dialog("Cannot recreate booking system structure after data was received.");
                            console.error(err);
                            console.error(data);
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
        event_container.append(container);
    })
}

function linkify(link_str){
    if (!/^(?:f|ht)tps?\:\/\//.test(link_str)) {
        link_str = "http://" + link_str;
    }
    return link_str;
}