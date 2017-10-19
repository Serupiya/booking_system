var loaded;
var should_load = 3;

function load() {
    loaded = 0;
    var comment_div = $("#loading_comments");
    var container = $("<div></div>");
    comment_div.append(container);
    fetch_all_projects(2, container);
    container = $("<div></div>");
    comment_div.append(container);
    fetch_all_global_events(2, container);
    container = $("<div></div>");
    comment_div.append(container);
    get_config(2, container);
}


function get_config(retry, status_div) {
    var status_span = $("<span>Fetching config from database...</span>");
    status_div.append(status_span);
    config = {
        "ate_operators": [],
        "teams": [],
        "build_stations": [],
        "exec_stations": []
    };
    $.ajax({
        type: "POST",
        url: "/views/config/get_config.php",
        success: function(data) {
            if (data["error"] !== undefined) {
                status_div.append($("<span style='color: indianred'>" + data["error"] + "</span>"));
                load_fail();
            } else {
                for (var key in data) {
                    config[key] = data[key];
                }
                status_div.append($("<span style='color: limegreen'>OK</span>"));
                loaded++;
                finish_load();
            }
        },
        error: function(request, status, error) {
            console.log(request, status, error);
            retry--;
            if (retry) {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all (Retrying)</span>"));
                status_div.append("<br>");
                fetch_all_projects(retry, status_div);
            } else {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all</span>"));
                load_fail();
            }
        }
    });
}

function fetch_all_projects(retry, status_div) {
    var status_span = $("<span>Fetching projects from database...</span>");
    status_div.append(status_span);
    $.ajax({
        type: "GET",
        url: "views/get_projects.php",
        success: function(project_arr) {
            var success = true;
            if (project_arr["error"] !== undefined) {
                status_div.append($("<span style='color: indianred'>" + project_arr["error"] + "</span>"));
                success = false;
                load_fail();
            } else {
                projects = project_arr;
            }
            if (success) {
                status_div.append($("<span style='color: limegreen'>OK</span>"));
                status_div.append("<br>");
                loaded++;
                finish_load();

            }
        },
        error: function(request, status, error) {
            console.log(request, status, error);
            retry--;
            if (retry) {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all (Retrying)</span>"));
                status_div.append("<br>");
                fetch_all_projects(retry, status_div);
            } else {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all</span>"));
                load_fail();
            }
        }
    });
}

function fetch_all_global_events(retry, status_div) {
    var status_span = $("<span>Fetching global events from database...</span>");
    status_div.append(status_span);
    $.ajax({
        type: "GET",
        url: "views/get_global_events.php",
        success: function(event_array) {
            var success = true;
            if (event_array["error"] !== undefined) {
                status_div.append($("<span style='color: indianred'>" + event_array["error"] + "</span>"));
                success = false;
                load_fail();
            } else {
                global_events = event_array;
            }
            if (success) {
                status_div.append($("<span style='color: limegreen'>OK</span>"));
                status_div.append("<br>");
                loaded++;
                finish_load();
            }
        },
        error: function(request, status, error) {
            console.log(request, status, error);
            retry--;
            if (retry) {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all (Retrying)</span>"));
                status_div.append("<br>");
                fetch_all_global_events(retry, status_div);
            } else {
                status_div.append($("<span style='color: indianred'>ERROR Received wrong data or no data at all</span>"));
                load_fail();
            }
        }
    });
}

function finish_load() {
    if (loaded === 3) {
        var container = $("<div></div>");
        $("#loading_comments").append(container);
        load_design(container);
    }
}

function load_fail() {
    var img = $("#loading_img");
    $.when(img.animate({
        opacity: 0
    }, 300)).then(function() {
        img.attr("src", "templates/css/images/fail.png");
        img.animate({
            opacity: 100
        }, 300)
    });
}

function remove_loading_screen() {
    $("#load_prep_container").show();
    $("#loading_screen").delay(1000).fadeOut("slow");

}


function block_screen_with_load() {
    $("#load_overlay").fadeIn();
}

function unblock_screen_with_load() {
    $("#load_overlay").fadeOut();
}

function show_error_dialog(text) {
    $("#error_msg_dialog_text").text(text);
    $("#error_msg_dialog").dialog("open")
    console.error(text);
}

function hack_tooltips() {
    $(function() {
        $(document).tooltip({
            content: function() {
                return this.getAttribute("title");
            }
        });
    });
}

function load_design(status_div) {
    var status_span = $("<span>Loading page structure...</span>");
    status_div.append(status_span);
    var success;
    try {
        config_to_visuals();
        load_reserve_dialog();
        load_config_dialog();
        load_page_structure();
        load_global_event_dialog();
        load_movers();
        load_view_style();
        hack_tooltips();
        window_resize();
        auth_init();
        success = true;
    } catch (err) {
        status_div.append($("<span style='color:indianred'>ERROR (Check console for more info)</span>"));
        console.error("ERROR: ", err);
        load_fail();
        success = false;
    }
    if (success) {
        status_div.append($("<span style='color:limegreen'>OK</span>"));
        remove_loading_screen();
    }
}