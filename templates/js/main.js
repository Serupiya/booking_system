var build_machines;
var exec_machines;
var ate_operators;
var teams;
var exec_machine_frameworks;
var exec_locations;
var build_machine_links;
var projects;
var global_events = [];
/*
var build_machines = [
    "Adriatic",
    "Baltic",
    "Barents",
    "Celtic",
    "Kara",
    "Tasman",
    "Timor",
    "Coral",
    "TBD"
];
var exec_machines = [
    "Eiger",
    "Elbrus",
    "Gerlach",
    "Matterhorn",
    "Pelmo",
    "Triglav",
    "Zugspitze",
    "Olympus",
    "TBD"
];


var ate_operators = [
    "ate_operator1",
    "ate_operator2",
    "ate_operator3"
];
var teams = [
    "team1",
    "team2",
    "team3"
];
var framework_version = [
  "MAF1",
  "MAF2",
  "VDK"
];
var exec_machine_frameworks = {
    "MAF1": ["Eiger",
             "Elbrus",
             "Gerlach"],
    "MAF2": ["Matterhorn",
             "Pelmo",
             "Triglav"],
    "VDK": ["Zugspitze",
            "Olympus"]
};
var exec_locations = {
    "Roznov": ["Eiger",
                "Elbrus",
                "Pelmo",
                "Triglav",],
    "Hanui": ["Zugspitze",
        "Olympus",
        "Gerlach",
        "Matterhorn"]
};

var build_machine_links = {
    "Adriatic": "http://adriatic.ea.freescale.net",
    "Baltic": "http://Baltic.ea.freescale.net",
    "Barents": "http://Barents.ea.freescale.net",
    "Celtic": "http://Celtic.ea.freescale.net",
    "Kara": "http://Kara.ea.freescale.net",
    "Tasman": "http://Tasman.ea.freescale.net",
    "Timor": "http://Timor.ea.freescale.net",
    "Coral": "http://Coral.ea.freescale.net",
};

var projects = [
    {"name":"MATTERHORN V10","start_date":"09/21/2017","end_date":"10/05/2017",
        "ate_operator":"ate_operator2","team":"team2",
        "derivatives":[{"name":"XLM23UIU","exec_station":"Matterhorn","build_station":"Kara"},
            {"name":"XLM44XA","exec_station":"Matterhorn","build_station":"Tasman"}],
        "framework":"MAF2","location":"Roznov","sw_versions":"WORD v1","hw_versions":"1gb ram","additional_info":"gut"},
    {"name":"MATTERHORN V3","start_date":"09/03/2017","end_date":"09/14/2017","ate_operator":"ate_operator2",
        "team":"team3","derivatives":[{"name":"MV43","exec_station":"Matterhorn","build_station":"Barents"}],
        "framework":"MAF2","location":"Hanui","sw_versions":"1","hw_versions":"2","additional_info":"3"},
    {"name":"mmmk","start_date":"12/06/2017","end_date":"01/10/2018","ate_operator":"ate_operator1",
        "team":"team1","derivatives":[{"name":"mm","exec_station":"Eiger","build_station":"TBD"},
        {"name":"mnm","exec_station":"Eiger","build_station":"TBD"},
        {"name":"bnbn","exec_station":"Eiger","build_station":"TBD"}],
        "framework":"MAF1","location":"Roznov","sw_versions":"","hw_versions":"","additional_info":""}
];

var global_events = [

];

*/
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
var currently_edited_project;
var reserve_dialog;
var create_project_dialog;
var project_edit_name_select;
/* project: project_name
            team
            team_leader
            start_date
            end_date
            derivatives: derivative_name
                         build_machine (af_link?)
                         exec_machine
            sw_versions
            hw_versions
            additional_info

*/



var chosen_rows;
var chosen_row_type;
var page_structure = [
];


var first_date;
var last_date;

var column_count = 54;

function load_column_chooser(){
    var column_select = $("#column_chooser");
    column_select.selectmenu({
        change: function(event, data){
            create_table(data.item.value);
            $.cookie("category", column_select.val());
        }
    });
    var saved_category = $.cookie("category");
    column_select.val(saved_category !== undefined? saved_category : "Execution Machines");
    column_select.selectmenu("refresh");
    chosen_row_type = "Execution Machines";
    create_table(column_select.val());
}

function create_table(rows){
    chosen_row_type = rows;
    switch(rows) {
        case "Build Machines":
            redo_columns(build_machines);
            add_build_machine_links();
            break;
        case "Execution Machines":
            redo_columns(exec_machines);
            break;
        case "Projects":
            var project_names = [];
            $.each(projects, function (i, project) {
                project_names.push(project["name"]);
            });
            redo_columns(project_names);
            break;
        case "ATE operators":
            redo_columns(ate_operators);
            break;
    }
}

function add_build_machine_links(){
    $(".row_desc").each(function(){
        $(this).click(function(){
            var name = $(this).text();
            window.open(build_machine_links[name],'_blank');
        });
    });
}

function redo_columns(arr){
    var rows = $("#row_descriptor");
    rows.empty();
    chosen_rows = arr;
    $.each(arr, function(i, val){
        rows.append("<div class=row_desc>" + val + "</div>");
    });
    generate_cells();
    generate_weekend();
    generate_global_events();
}

function generate_weekend(){
    if (view_style.val() === "daily") {
        $.each(page_structure, function (i, struct) {
            if (is_weekend(struct["date"][2], struct["date"][1], struct["date"][0])) {
                struct["column"].children().addClass("weekend");
                struct["column"].children().each(function () {
                    if ($(this).attr("title") === undefined) {
                        $(this).attr("title", "weekend");
                    } else {
                        $(this).attr("title", $(this).attr("title") + "(weekend)");
                    }
                })
            }
        });
    }
}

function generate_global_events(){
    $.each(global_events, function(i, event){
        var start = formated_to_date_array(event["start"]);
        var end = formated_to_date_array(event["end"]);
            $.each(page_structure, function(j, struct){
                if ((struct["end_date"] === undefined && date_in_dates(struct["date"], start, end)) ||
                    (struct["end_date"] !== undefined && dates_overlap(struct["date"], struct["end_date"], start, end))){
                    struct["column"].children().addClass("event");
                    struct["column"].children().each(function(){
                        if ($(this).attr("title") === undefined){
                            $(this).attr("title", event["name"]);
                        } else{
                            $(this).attr("title", $(this).attr("title") + "(" + event["name"] + ")");
                        }

                    });
                }

            })
    });
}



function load_next(){
    var days_div;
    var month_container = $(".month");
    var next_date;
    var month_div;
    if (view_style.val() === "daily"){
        next_date = get_next_day(last_date[0], last_date[1], last_date[2]);
        if (next_date[1] !== last_date[1] || month_container.length === 0){
            month_div = $("<div class='month'></div>");
            date_header.append(month_div);
            month_div.append("<div class='month_name thick'><div class='fixed'>" + get_month_name(next_date[1]) + " " +  next_date[2] + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else{
            days_div = month_container.last().find(".days");
        }
        page_structure.push({"date": next_date});
        var day = $("<div class='day'>" + next_date[0] + "</div>");
        if (next_date[0] === 1){
            day.addClass("thick")
        }
        days_div.append(day);
        last_date = next_date;
    } else{
        next_date = next_week(last_date[0], last_date[1],  last_date[2]);
        var week_num_arr = get_week_number(next_date[0], next_date[1], next_date[2]);
        var old_week_num_arr = get_week_number(last_date[0], last_date[1],  last_date[2]);
        if (week_num_arr[1] !== old_week_num_arr[1] || month_container.length === 0){
            month_div = $("<div class='month'></div>");
            date_header.append(month_div);
            month_div.append("<div class='month_name thick'><div class='fixed'>" + get_short_month_name(week_num_arr[1]) + "'" +  (week_num_arr[0] % 100 ) + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else{
            days_div = month_container.last().find(".days");
        }

        page_structure.push({"date": next_date, "end_date": get_last_day_of_week(next_date)});
        var week = $("<div class='day'>" + week_num_arr[2] + "</div>");
        if (next_date[0] === 1){
            week.addClass("thick")
        }
        days_div.append(week);
        last_date = next_date;
    }
}
function load_previous(){
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
        page_structure.unshift({"date": prev_date});
        var day = $("<div class='day'>" + prev_date[0] + "</div>");
        if (prev_date[0] === 1) {
            day.addClass("thick")
        }
        days_div.prepend(day);
        first_date = prev_date;
    } else{
        prev_date = prev_week(first_date[0], first_date[1], first_date[2]);
        var week_num_arr = get_week_number(prev_date[0], prev_date[1], prev_date[2]);
        var old_week_num_arr = get_week_number(first_date[0], first_date[1], first_date[2]);
        if (week_num_arr[1] !== old_week_num_arr[1]) {
            month_div = $("<div class='month'></div>");
            date_header.prepend(month_div);
            month_div.append("<div class='month_name thick'><div class='fixed'>" + get_short_month_name(week_num_arr[1]) + "'" +  (week_num_arr[0] % 100 )  + "</div></div>");
            days_div = $("<div class='days'></div>");
            month_div.append(days_div);
        } else {
            days_div = $(".month").first().find(".days");
        }
        page_structure.unshift({"date": prev_date, "end_date": get_last_day_of_week(prev_date)});
        var week = $("<div class='day'>" + week_num_arr[2] + "</div>");
        if (prev_date[0] === 1) {
            week.addClass("thick")
        }
        days_div.prepend(week);
        first_date = prev_date;
    }
}

function load_page_structure(){
    date_header.empty();
    page_structure = [];
    $("#overview").empty();
    if (view_style.val() === "daily") {
        first_date = get_current_day();
        first_date = get_previous_day(first_date[0], first_date[1], first_date[2]);
        last_date = first_date.slice();
    } else{
        first_date = get_first_day_of_week();
        first_date = prev_week(first_date[0], first_date[1], first_date[2]);
        last_date = first_date.slice();
    }
    for (var i = 0; i<column_count; i++){
        load_next();
    }
    load_column_chooser();

}

function generate_cells(){
    var overview = $("#overview");
    overview.empty();
    $.each(page_structure, function(i, struct){
        var col = $("<div class='column'></div>");
        overview.append(col);
        struct["column"] = col;
    });

    $.each(chosen_rows, function(i, row){
        var row_projects = get_projects_for_chosen_row(row);
        var projects_with_dates = [];
        $.each(row_projects, function(k, project){
            var start = formated_to_date_array(project["start_date"]);
            var end = formated_to_date_array(project["end_date"]);

            projects_with_dates.push({"start": start, "end": end, "project": project});
        });
        var filtered_projects = filter_projects_to_shown_date(projects_with_dates);
        var sorted_projects = sort_projects_for_no_overlap(filtered_projects);
        var desc_row =  $($(".row_desc")[i]);
        desc_row.css("height", 2*sorted_projects.length + "vw");

        var projects_with_nums = [];
        $.each(sorted_projects, function(j, row){
            var project_num = 0;

            $.each(page_structure, function(k, struct){
                var project_on_date = null;
               $.each(row, function(l, project){
                   if (struct["end_date"] === undefined){
                       var was_found;
                       if (date_in_dates(struct["date"], project["start"], project["end"])){
                           project_on_date = project["project"];
                           was_found = projects_with_nums.indexOf(project_on_date);
                           if (was_found === -1){
                               projects_with_nums.push(project_on_date)
                           }
                       }
                   } else{
                       if (dates_overlap(struct["date"], struct["end_date"], project["start"], project["end"])){
                           project_on_date = project["project"];
                           was_found = projects_with_nums.indexOf(project_on_date);
                           if (was_found === -1){
                               projects_with_nums.push(project_on_date)
                           }
                       }
                   }
               });
               var cell = $("<div class='cell'></div>");
                if (view_style.val() === "daily") {
                   if (k === 0 || page_structure[k-1]["date"][1] !== struct["date"][1]){
                        cell.addClass("thick");
                   }
                } else{
                    if (k === 0 || get_week_number.apply(this, page_structure[k-1]["date"])[1]
                            !== get_week_number.apply(this, struct["date"])[1] ) {
                        cell.addClass("thick");
                    }
                }
               if (project_on_date){
                    cell.addClass("reserved");
                    cell.attr("title", project_on_date["name"]);
                    cell.addClass(projects_with_nums.indexOf(project_on_date)%2?"even_project":"odd_project");
                    project_num++;
                    cell.click(function(){
                         start_editing_project(project_on_date);
                    });
               }
               cell.addClass(page_structure[k]["column"].children().length%2?"even_row":"odd_row");

               struct["column"].append(cell);

            });
        });
    });
    $.each(page_structure, function(i, struct){
        overview.append(struct["column"]);
    });

    $( function() {
        $( document ).tooltip({
            track: true,
            show: false,
            hide: false
        });
    } );
}

function start_editing_project(project){
    reserve_dialog.dialog("open");
    $("#reserve_edit_div").show();
    $("#reserve_project_switch_tabs").tabs( "option", "active", 1 );
    roject_edit_name_select = $("#reserve_edit_project_name");
    project_edit_name_select.find("option[value='" + project["name"] + "']").attr("selected", true);
    project_edit_name_select.selectmenu("refresh");
    choose_project_to_edit();
}


function get_projects_for_chosen_row(row){
    var appliable_projects = [];
    $.each(projects, function(k, project){
        switch(chosen_row_type){
            case "Build Machines":
                $.each(project["derivatives"], function(i, derivative){
                    if (derivative["build_station"] === row){
                        appliable_projects.push(project);
                    }
                });
                $.each(project["quality_pack_stations"], function(i, station){
                    if (station === row){
                        appliable_projects.push(project);
                    }
                });
                break;
            case "Execution Machines":
                $.each(project["derivatives"], function(i, derivative){
                    if (derivative["exec_station"] === row){
                        appliable_projects.push(project);
                    }
                });
                break;
            case "ATE operators":
                if (project["ate_operator"] === row){
                    appliable_projects.push(project);
                }
                break;
            case "Projects":
                if (project["name"] === row){
                    appliable_projects.push(project);
                }
        }
    });
    return appliable_projects;
}

function filter_projects_to_shown_date(project_list){
    var new_project_list = [];
    $.each(project_list, function(i, p){
        if (dates_overlap(p["start"], p["end"], first_date, last_date)){
            new_project_list.push(p);
        }
    });
    return new_project_list;

}

function move_left(){
    if (moving){
        setTimeout(move_left, 50);
        $(".day").last().remove();
        if (!$(".days").last().children().length){
            $(".month").last().remove();
        }
        page_structure.pop();
        first_date = page_structure[0]["date"];
        last_date = page_structure[page_structure.length-1]["date"];
        load_previous();
    }
}

function move_right(){
    if (moving){
        setTimeout(move_right, 50);
        $(".day").first().remove();
        if (!$(".days").first().children().length){
            $(".month").first().remove();
        }
        page_structure.splice(0, 1);
        first_date = page_structure[0]["date"];
        last_date = page_structure[page_structure.length-1]["date"];
        load_next();
    }
}

var moving = false;
function load_movers(){
    var left_mover = $("#mover_left");
    left_mover.on("mousedown", function(){
        $(".column").hide();
        moving = true;
        move_left();
    });
    left_mover.on("mouseup", function(){
       moving = false;
        create_table($("#column_chooser").val());
    });
    var right_mover = $("#mover_right");
    right_mover.on("mousedown", function(){
        $(".column").hide();
        moving = true;
        move_right(page_structure.length-1);
    });
    right_mover.on("mouseup", function(){
        moving = false;
        create_table($("#column_chooser").val());
    });
}

function load_view_style(){
    view_style.selectmenu({
        "change": function(){
            $.cookie("time_base", $(this).val());
            load_page_structure();
        }
    });
    var saved_value = $.cookie("time_base");
    if (saved_value !== undefined){
        view_style.val(saved_value);
        view_style.selectmenu("refresh");
        load_page_structure();
    }
}

$(document).ready(function(){
    project_edit_name_select = $("#reserve_edit_project_name");
    project_name_select = $("#reserve_project_name");
    project_leader_select = $("#reserve_leader");
    project_name_input = $("#reserve_new_project_name");
    team_select = $("#reserve_team");
    start_date_input = $("#start_date");
    end_date_input = $("#end_date");
    reserve_derivative_div = $("#reserve_derivative_div");
    //reserve_derivative_links = $("#reserve_derivative_links");
    reserve_derivative = $("#reserve_derivative");
    main_tabs = $("#reserve_project_switch_tabs");
    create_new_project_div = $("#reserve_create_new_project");
    sw_versions = $("#sw_versions");
    hw_versions = $("#hw_versions");
    additional_info = $("#additional_info");
    project_framework = $("#framework");
    date_header = $("#date_header_contents");
    view_style = $("#view_style");
    load();
});