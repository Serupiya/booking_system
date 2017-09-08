function next_week(d, m, y){
    var date = new Date(y, m-1, d);
    date.setDate(date.getDate() + 7);
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
}
function prev_week(d, m, y){
    var date = new Date(y, m-1, d);
    date.setDate(date.getDate() - 7);
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
}

function get_first_day_of_week(){
    var d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
    var first =  new Date(d.setDate(diff));
    return [first.getDate(), first.getMonth() + 1, first.getFullYear()];
}

Date.prototype.getYearMonthWeekNum = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */

    dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(),0,1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() -
        (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if(day < 4) {
        weeknum = Math.floor((daynum+day-1)/7) + 1;
        if(weeknum > 52) {
            var nYear = new Date(this.getFullYear() + 1,0,1);
            var nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
               the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
            return [nYear.getFullYear(), 1, weeknum];
        }
    }
    else {
        weeknum = Math.floor((daynum+day-1)/7);
    }
    return [this.getFullYear(), this.getMonth() + 1, weeknum];
};

function get_week_number(d, m, y){
    var date = new Date(y, m-1, d);
    return date.getYearMonthWeekNum();
}

function get_next_day(d, m, y){
    d = Number(d);
    m = Number(m);
    y = Number(y);
    if (d === new Date(y, m, 0).getDate()){
        if (m !== 12){
            m++;
        }else{
            y++;
            m = 1;
        }
        d = 1;
    }else{
        d++;
    }
    return [d, m, y];
}

function get_previous_day(d, m, y) {
    d = Number(d);
    m = Number(m);
    y = Number(y);
    d--;
    if (d === 0){
        m--;
        d = new Date(y, m, 0).getDate();
        if (m === 0){
            m = 12;
            y--;
        }
    }
    return [d, m, y];
}

function get_last_day_of_week(first_date_array){
    var first_date = new Date(first_date_array[2], first_date_array[1]-1, first_date_array[0]);
    var end_date = new Date(first_date.setDate(first_date.getDate() - first_date.getDay()+7));
    return [end_date.getDate(), end_date.getMonth() +1, end_date.getFullYear()];
}

function get_current_day(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yy = today.getFullYear();
    return [dd, mm, yy]
}

function get_month_name(month){
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return monthNames[month-1];
}

function get_short_month_name(month){
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return monthNames[month-1];
}

function is_weekend(year, month, day){

    var day_num = new Date(year, month-1, day).getDay();
    return day_num === 6 || day_num === 0;

}


function formated_to_date_array(formatted){
    var arr = formatted.split("/");
    var tmp = arr[0];
    arr[0] = arr[1];
    arr[1] = tmp;
    for (var i = 0; i<3; i++){
        arr[i] = Number(arr[i]);
    }
    return arr;
}


function date_in_dates(date, start_date, end_date){
    for (var i = 2; i>=0; i--) {
        if (date[i] < start_date[i]) {
            return false;
        } else if (date[i] > start_date[i]) {
            break;
        }
    }
    for (var i = 2; i>=0; i--) {
        if (date[i] > end_date[i]) {
            return false;
        } else if (date[i] < end_date[i]) {
            break;
        }
    }
    return true;

}

function dates_overlap(date1_start, date1_end, date2_start, date2_end){
    return (date_in_dates(date1_start, date2_start, date2_end) || date_in_dates(date1_end, date2_start, date2_end) ||
            date_in_dates(date2_start, date1_start, date1_end) || date_in_dates(date2_end, date1_start, date1_end))
}

function sort_projects_for_no_overlap(projects_with_dates){
    var rows = [[]];
    $.each(projects_with_dates, function(i, project){
        var found_space = false;
        $.each(rows, function(j, row){
            if (!found_space){
                var space_in_row = true;
                $.each(row, function(k, assigned_project){
                    if (space_in_row){
                        if (dates_overlap(project["start"], project["end"],
                                assigned_project["start"], assigned_project["end"])){
                            space_in_row = false;
                        }
                    }
                });
                if (space_in_row){
                    row.push(project);
                    found_space = true;
                }
            }
        });
       if (!found_space){
           rows.push([project]);
       }
    });
    return rows;
}

function check_start_end_time(start_time, end_time){
    if (start_time === "" || end_time === ""){
        return false;
    }
    var date1 = formated_to_date_array(start_time);
    var date2 =  formated_to_date_array(end_time);
    for (var i = 2; i>=0; i--) {
        if (date1[i] > date2[i]) {
            return false;
        } else if (date1[i] < date2[i]) {
            break;
        }
    }
    return true;
}

function get_possible_reservation_slots(start_date, end_date, own_project){
    var viable_exec_machines = exec_machine_frameworks[project_framework.val()].slice();
    viable_exec_machines.push("TBD");
    var viable_build_machines = build_machines.slice();
    var used_build_machines = [];
    $.each(projects, function(i, project){
       if (own_project === undefined || project["name"] !== own_project){
           if (dates_overlap(start_date, end_date,
                   formated_to_date_array(project["start_date"]), formated_to_date_array(project["end_date"]))){
               $.each(project["derivatives"], function(k, derivative){
                   if (derivative["exec_station"] !== "TBD"){
                       var j = viable_exec_machines.indexOf(derivative["exec_station"]);
                       if (j >= 0){
                           viable_exec_machines.splice(j, 1);
                       }
                   }
                   if (derivative["build_station"] !== "TBD") {
                       j = viable_build_machines.indexOf(derivative["build_station"]);
                       if (j >= 0) {
                           viable_build_machines.splice(j, 1);
                           used_build_machines.push(derivative["build_station"]);
                       }
                   }
               });

           }
       }
    });
    return {"exec_machines": viable_exec_machines,
            "build_machines": viable_build_machines,
            "used_build_machines": used_build_machines}
}