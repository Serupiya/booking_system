var build_machines;
var exec_machines;
var ate_operators;
var teams;
var exec_machine_frameworks;
var exec_locations;
var build_machine_links;
var projects;
var global_events = [];
var config;
var project_edit_name_select;
var project_name_select;
var project_leader_select;
var project_name_input;
var team_select;
var start_date_input;
var end_date_input;
var reserve_derivative_div;
var reserve_derivative;
var main_tabs;
var create_new_project_div;
var sw_versions;
var hw_versions;
var additional_info;
var project_framework;
var view_style;
var date_header;
var currently_edited_ate_milestone;
var currently_edited_link;
var reserve_dialog;
var chosen_rows;
var chosen_row_type;
var page_structure = [];
var first_date;
var last_date;
var column_count;

function load_column_chooser() {
    var column_select = $("#column_chooser");
    column_select.selectmenu({
        change: function(event, data) {
            create_table(data.item.value);
            $.cookie("category", column_select.val());
        }
    });
    var saved_category = $.cookie("category");
    column_select.val(saved_category !== undefined ? saved_category : "Execution Machines");
    column_select.selectmenu("refresh");
    chosen_row_type = "Execution Machines";
    create_table(column_select.val());
}

function create_table(rows) {
    chosen_row_type = rows;
    switch (rows) {
        case "Build Machines":
            redo_columns(build_machines);
            add_build_machine_links();
            break;
        case "Execution Machines":
            redo_columns(exec_machines);
            break;
        case "Projects":
            var project_names = [];
            $.each(projects, function(i, project) {
                project_names.push(project["name"]);
            });
            redo_columns(project_names);
            break;
        case "Teams":
            redo_columns(teams);
            break;
        case "ATE operators":
            redo_columns(ate_operators);
            break;
    }
}

function add_build_machine_links() {
    $(".row_desc").each(function() {
        $(this).click(function() {
            var name = $(this).text();
            window.open(build_machine_links[name], '_blank');
        });
    });
}

function redo_columns(arr) {
    var rows = $("#row_descriptor");
    rows.empty();
    chosen_rows = arr;
    $.each(arr, function(i, val) {
        var row_descriptor_div = $("<div class=row_desc></div>");
        if (i !== 0) {
            row_descriptor_div.css("margin-top", "3px");
        }
        var centered_descriptor = $("<div class='centered'>" + val + "</div>");
        var img = $("<div class='row_descriptor_img'></div>");
        if (i % 2) {
            img.addClass("odd");
        } else {
            img.addClass("even");
        }
        if (i === arr.length - 1) {
            row_descriptor_div.css("border-bottom", 0);
        }
        row_descriptor_div.append(centered_descriptor);
        row_descriptor_div.append(img);
        rows.append(row_descriptor_div);
    });
    generate_cells();
    generate_weekend();
    generate_global_events();
}

function generate_weekend() {
    if (view_style.val() === "daily") {
        $.each(page_structure, function(i, struct) {
            if (is_weekend(struct["date"][2], struct["date"][1], struct["date"][0])) {
                struct["column"].children().addClass("weekend");
                struct["column"].children().each(function() {
                    if ($(this).attr("title") === undefined) {
                        $(this).attr("title", "<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px'>Weekend</div></div>");
                    } else {
                        var tooltip = $("<div></div>");
                        tooltip.append($($(this).attr("title")).clone());
                        var events = tooltip.find(".tooltip_events");
                        if (events.length) {
                            events.append("<div style='margin-left:20px'>Weekend</div>");
                        } else {
                            tooltip.append("<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px'>Weekend</div></div>");
                        }
                        $(this).attr("title", tooltip.html());
                    }
                })
            }
        });
    }
}

function generate_global_events() {
    $.each(global_events, function(i, event) {
        var start = formated_to_date_array(event["start"]);
        var end = formated_to_date_array(event["end"]);
        $.each(page_structure, function(j, struct) {
            if ((struct["end_date"] === undefined && date_in_dates(struct["date"], start, end)) ||
                (struct["end_date"] !== undefined && dates_overlap(struct["date"], struct["end_date"], start, end))) {
                struct["column"].children().addClass("event");
                struct["column"].children().each(function() {
                    var event_string = event["name"] + " (" + event["start"] + " - " + event["end"] + ")";
                    if ($(this).attr("title") === undefined) {
                        $(this).attr("title", "<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px'>" + event_string + "</div></div>");
                    } else {
                        var tooltip = $("<div></div>");
                        tooltip.append($($(this).attr("title")).clone());
                        var events = tooltip.find(".tooltip_events");
                        if (events.length) {
                            events.append("<div style='margin-left:20px'>" + event_string + "</div>");
                        } else {
                            tooltip.append("<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px'>" + event_string + "</div></div>");
                        }
                        $(this).attr("title", tooltip.html());
                    }
                });
            }

        })
    });
}



function load_next() {
    var days_div;
    var month_container = $(".month");
    var next_date;
    var month_div;
    if (view_style.val() === "daily") {
        next_date = get_next_day(last_date[0], last_date[1], last_date[2]);
        if (next_date[1] !== last_date[1] || month_container.length === 0) {
            month_div = $("<div class='month'></div>");
            date_header.append(month_div);
            month_div.append("<div class='month_name'><div class='fixed'>" + get_month_name(next_date[1]) + " " + next_date[2] + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else {
            days_div = month_container.last().find(".days");
        }
        page_structure.push({
            "date": next_date
        });
        var day = $("<div class='day'>" + next_date[0] + "</div>");

        days_div.append(day);
        last_date = next_date;
    } else {
        next_date = next_week(last_date[0], last_date[1], last_date[2]);
        var week_num_arr = get_week_number(next_date[0], next_date[1], next_date[2]);
        var old_week_num_arr = get_week_number(last_date[0], last_date[1], last_date[2]);
        if (week_num_arr[1] !== old_week_num_arr[1] || month_container.length === 0) {
            month_div = $("<div class='month'></div>");
            date_header.append(month_div);
            month_div.append("<div class='month_name'><div class='fixed'>" + get_short_month_name(week_num_arr[1]) + "'" + (week_num_arr[0] % 100) + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else {
            days_div = month_container.last().find(".days");
        }

        page_structure.push({
            "date": next_date,
            "end_date": get_last_day_of_week(next_date)
        });
        var week = $("<div class='day'>" + week_num_arr[2] + "</div>");
        days_div.append(week);
        last_date = next_date;
    }
}

function load_previous() {
    var days_div;
    var prev_date;
    var month_div;
    if (view_style.val() === "daily") {
        prev_date = get_previous_day(first_date[0], first_date[1], first_date[2]);

        if (prev_date[1] !== first_date[1]) {
            month_div = $("<div class='month'></div>");
            date_header.prepend(month_div);
            month_div.append("<div class='month_name thick'><div class='fixed'>" + get_month_name(prev_date[1]) + " " + prev_date[2] + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else {
            days_div = $(".month").first().find(".days");
        }
        page_structure.unshift({
            "date": prev_date
        });
        var day = $("<div class='day'>" + prev_date[0] + "</div>");
        if (prev_date[0] === 1) {
            day.addClass("thick")
        }
        days_div.prepend(day);
        first_date = prev_date;
    } else {
        prev_date = prev_week(first_date[0], first_date[1], first_date[2]);
        var week_num_arr = get_week_number(prev_date[0], prev_date[1], prev_date[2]);
        var old_week_num_arr = get_week_number(first_date[0], first_date[1], first_date[2]);
        if (week_num_arr[1] !== old_week_num_arr[1]) {
            month_div = $("<div class='month'></div>");
            date_header.prepend(month_div);
            month_div.append("<div class='month_name thick'><div class='fixed'>" + get_short_month_name(week_num_arr[1]) + "'" + (week_num_arr[0] % 100) + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else {
            days_div = $(".month").first().find(".days");
        }
        page_structure.unshift({
            "date": prev_date,
            "end_date": get_last_day_of_week(prev_date)
        });
        var week = $("<div class='day'>" + week_num_arr[2] + "</div>");
        if (prev_date[0] === 1) {
            week.addClass("thick")
        }
        days_div.prepend(week);
        first_date = prev_date;
    }
}

function load_page_structure() {
    date_header.empty();
    page_structure = [];
    $("#overview").empty();
    if (view_style.val() === "daily") {
        if (!first_date) {
            first_date = get_current_day();
            first_date = get_previous_day(first_date[0], first_date[1], first_date[2]);
        }
        last_date = first_date.slice();
    } else {
        if (!first_date) {
            first_date = get_first_day_of_current_week();
        } else {
            first_date = get_first_day_of_week(new Date(first_date[2], first_date[1] - 1, first_date[0]));
        }
        first_date = prev_week(first_date[0], first_date[1], first_date[2]);
        last_date = first_date.slice();
    }
    for (var i = 0; i < column_count; i++) {
        load_next();
    }
    load_column_chooser();

}

function generate_cells() {
    var overview = $("#overview");
    overview.empty();
    $.each(page_structure, function(i, struct) {
        var col = $("<div class='column'></div>");
        overview.append(col);
        struct["column"] = col;
    });

    $.each(chosen_rows, function(i, row) {
        var row_projects = get_projects_for_chosen_row(row);
        var row_events = get_events_for_chosen_row(row);
        var projects_with_dates = [];
        $.each(row_projects, function(k, project) {
            var start = formated_to_date_array(project["start_date"]);
            var end = formated_to_date_array(project["end_date"]);

            projects_with_dates.push({
                "start": start,
                "end": end,
                "project": project
            });
        });
        var filtered_projects = filter_projects_to_shown_date(projects_with_dates);
        var sorted_projects = sort_projects_for_no_overlap(filtered_projects);
        var desc_row = $($(".row_desc")[i]);
        desc_row.css("height", (30 * sorted_projects.length + (i === 0 ? 1 : 2)) + "px");

        var projects_with_nums = [];
        $.each(sorted_projects, function(project_index, project_row) {
            var project_num = 0;

            $.each(page_structure, function(k, struct) {
                var project_on_date = null;
                $.each(project_row, function(l, project) {
                    if (struct["end_date"] === undefined) {
                        var was_found;
                        if (date_in_dates(struct["date"], project["start"], project["end"])) {
                            project_on_date = project["project"];
                            was_found = projects_with_nums.indexOf(project_on_date);
                            if (was_found === -1) {
                                projects_with_nums.push(project_on_date)
                            }
                        }
                    } else {
                        if (dates_overlap(struct["date"], struct["end_date"], project["start"], project["end"])) {
                            project_on_date = project["project"];
                            was_found = projects_with_nums.indexOf(project_on_date);
                            if (was_found === -1) {
                                projects_with_nums.push(project_on_date)
                            }
                        }
                    }
                });
                var cell = $("<div class='cell'></div>");
                if (view_style.val() === "daily") {
                    if (k === 0 || page_structure[k - 1]["date"][1] !== struct["date"][1]) {
                        cell.addClass("thick");
                    }
                } else {
                    if (k === 0 || get_week_number.apply(this, page_structure[k - 1]["date"])[1] !==
                        get_week_number.apply(this, struct["date"])[1]) {
                        cell.addClass("thick");
                    }
                }
                if (project_on_date) {
                    cell.addClass("reserved");
                    var tooltip = $("<div></div>");
                    tooltip.append("<div>Project: " + project_on_date["name"] + "</div>");
                    tooltip.append("<div>ATE Operator: " + project_on_date["ate_operator"] + "</div>");
                    if (project_on_date["derivatives"] !== undefined && project_on_date["derivatives"].length) {
                        tooltip.append("<div>Derivatives:</div>");
                        $.each(project_on_date["derivatives"], function() {
                            tooltip.append("<div style='margin-left:25px'>" + this["name"] + " - " + this["build_station"] + "</div>");
                        });
                    }
                    cell.attr("title", tooltip.html());
                    cell.css("background-color", project_on_date["color"]);
                    project_num++;
                    cell.click(function() {
                        start_editing_project(project_on_date);
                    });
                }

                if (i % 2) {
                    cell.addClass("odd");
                } else {
                    cell.addClass("even");
                }

                if (project_index === 0 && i !== 0) {
                    var separator = $("<div class='separator'></div>");
                    cell.append(separator);
                    cell.css("height", "35px");
                    //cell.addClass("separator");
                }

                if (row_events !== undefined && row_events.length) {
                    var used_dates = [];
                    $.each(row_events, function() {

                        var form_date = formated_to_date_array(this["date"]);
                        if (struct["end_date"] !== undefined && date_in_dates(form_date, struct["date"], struct["end_date"]) || check_same_date(form_date, struct["date"])) {
                            if (used_dates.indexOf(this["date"]) !== -1) {
                                console.log(used_dates.indexOf(this["date"]));
                                console.log(cell.find(".project_event_marker"));
                                cell.find(".project_event_marker").find(".symbol_text").text(cell.find(".project_event_marker").find(".symbol_text").text() + this["symbol"]);
                            } else {
                                if (project_index === 0 && i !== 0) {
                                    cell.append("<div class='project_event_marker' style='height:calc(100% - 5px);color: " + this["color"] + "; background-color: " + this["project_color"] + "'><div>" + this["symbol"] + "</div></div>");
                                } else {
                                    cell.append("<div class='project_event_marker' style='color: " + this["color"] + "; background-color: " + this["project_color"] + "'><div class='symbol_text'>" + this["symbol"] + "</div></div>");
                                }
                            }
                            var text;
                            if (!project_on_date) {
                                text = this["project_name"] + " - " + this["description"] + " (" + this["date"] + ")";
                            } else {
                                text = this["description"] + " (" + this["date"] + ")";
                            }

                            if (cell.attr("title") === undefined) {
                                cell.attr("title", "<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px;font-weight: bold'>" + text + "</div></div>");
                            } else {
                                var tooltip = $("<div></div>");
                                tooltip.append($(cell.attr("title")).clone());
                                var events = tooltip.find(".tooltip_events");


                                if (events.length) {
                                    events.append("<div style='margin-left:20px;font-weight: bold'>" + text + "</div>");
                                } else {
                                    tooltip.append("<div class='tooltip_events'><div>Events:</div><div style='margin-left:20px;font-weight: bold'>" + text + "</div></div>");
                                }
                                cell.attr("title", tooltip.html());
                            }
                            used_dates.push(this["date"]);


                        }
                    })
                }
                //cell.addClass(page_structure[k]["column"].children().length%2?"even_row":"odd_row");

                struct["column"].append(cell);

            });
        });
    });
    $.each(page_structure, function(i, struct) {
        overview.append(struct["column"]);
    });

    $(function() {
        $(document).tooltip({
            track: true,
            show: false,
            hide: false
        });
    });
}

function getContrastYIQ(hexcolor) {
    var r = parseInt(hexcolor.substr(1, 2), 16);
    var g = parseInt(hexcolor.substr(3, 2), 16);
    var b = parseInt(hexcolor.substr(5, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}


function start_editing_project(project) {
    reserve_dialog.dialog("open");
    $("#reserve_edit_div").show();
    $("#reserve_project_switch_tabs").tabs("option", "active", 1);
    project_edit_name_select = $("#reserve_edit_project_name");
    project_edit_name_select.find("option[value='" + project["name"] + "']").attr("selected", true);
    project_edit_name_select.selectmenu("refresh");
    choose_project_to_edit();
}


function get_projects_for_chosen_row(row) {
    var appliable_projects = [];
    $.each(projects, function(k, project) {
        switch (chosen_row_type) {
            case "Build Machines":
                $.each(project["derivatives"], function(i, derivative) {
                    if (derivative["build_station"] === row) {
                        appliable_projects.push(project);
                    }
                });
                break;
            case "Execution Machines":
                $.each(project["derivatives"], function(i, derivative) {
                    if (derivative["exec_station"] === row) {
                        appliable_projects.push(project);
                    }
                });
                break;
            case "ATE operators":
                if (project["ate_operator"] === row) {
                    appliable_projects.push(project);
                }
                break;
            case "Teams":
                if (project["team"] === row) {
                    appliable_projects.push(project);
                }
                break;
            case "Projects":
                if (project["name"] === row) {
                    appliable_projects.push(project);
                }
        }
    });
    return appliable_projects;
}

function get_events_for_chosen_row(row) {
    var events = [];
    if (chosen_row_type == "Projects") {
        $.each(projects, function(k, project) {
            if (project["name"] === row && events !== undefined) {
                events = project["events"];
                var color = getContrastYIQ(project["color"]);
                $.each(events, function() {
                    this["color"] = color;
                    this["project_color"] = project["color"];
                });
                return false;
            }
        });
    }
    return events;
}

function filter_projects_to_shown_date(project_list) {
    var new_project_list = [];
    $.each(project_list, function(i, p) {
        var end_d = page_structure[0]["end_date"] === undefined ? page_structure[page_structure.length - 1]["date"] : page_structure[page_structure.length - 1]["end_date"];
        if (dates_overlap(p["start"], p["end"], page_structure[0]["date"], end_d)) {
            new_project_list.push(p);
        }
    });
    return new_project_list;

}

function move_left() {
    if (moving) {
        setTimeout(move_left, 50);
        $(".day").last().remove();
        if (!$(".days").last().children().length) {
            $(".month").last().remove();
        }
        page_structure.pop();
        first_date = page_structure[0]["date"];
        last_date = page_structure[page_structure.length - 1]["date"];
        load_previous();
    }
}

function move_right() {
    if (moving) {
        setTimeout(move_right, 50);
        $(".day").first().remove();
        if (!$(".days").first().children().length) {
            $(".month").first().remove();
        }
        page_structure.splice(0, 1);
        first_date = page_structure[0]["date"];
        last_date = page_structure[page_structure.length - 1]["date"];
        load_next();
    }
}

var moving = false;

function load_movers() {
    var left_mover = $("#mover_left");
    left_mover.on("mousedown", function() {
        $(".column").hide();
        moving = true;
        move_left();
    });
    left_mover.on("mouseup", function() {
        moving = false;
        create_table($("#column_chooser").val());
    });
    var right_mover = $("#mover_right");
    right_mover.on("mousedown", function() {
        $(".column").hide();
        moving = true;
        move_right(page_structure.length - 1);
    });
    right_mover.on("mouseup", function() {
        moving = false;
        create_table($("#column_chooser").val());
    });
}

function load_view_style() {
    view_style.selectmenu({
        "change": function() {
            $.cookie("time_base", $(this).val());
            load_page_structure();
        }
    });
    var saved_value = $.cookie("time_base");
    if (saved_value !== undefined) {
        view_style.val(saved_value);
        view_style.selectmenu("refresh");
        load_page_structure();
    }
}

function get_col_num() {
    var total_width = ($(window).width() - 16) * window.devicePixelRatio;
    var main_width = total_width * 0.85;
    return Math.floor(main_width / 30);
}

function window_resize() {
    var total_width = ($(window).width() - 16) * window.devicePixelRatio;
    $("#filler").width(total_width * 0.08);
    $("#zoombreak_disabler").width(total_width);
    $("#row_descriptor").width(total_width / 10);
    var main_width = total_width * 0.9;
    $("#overview").width(main_width);
    $("#full_header").width(total_width);
    var col_num = get_col_num();
    if (column_count != col_num) {
        column_count = col_num;
        load_page_structure();
    }
}

$(document).ready(function() {
    project_edit_name_select = $("#reserve_edit_project_name");
    project_name_select = $("#reserve_project_name");
    project_leader_select = $("#reserve_leader");
    project_name_input = $("#reserve_new_project_name");
    team_select = $("#reserve_team");
    start_date_input = $("#start_date");
    end_date_input = $("#end_date");
    reserve_derivative_div = $("#reserve_derivative_div");
    reserve_derivative = $("#reserve_derivative");
    main_tabs = $("#reserve_project_switch_tabs");
    create_new_project_div = $("#reserve_create_new_project");
    sw_versions = $("#sw_versions");
    hw_versions = $("#hw_versions");
    additional_info = $("#additional_info");
    project_framework = $("#framework");
    date_header = $("#date_header_contents");
    view_style = $("#view_style");
    column_count = get_col_num();
    $(window).resize(window_resize);
    load();
});