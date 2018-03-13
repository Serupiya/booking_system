# booking_system
To make this work: <br>
1) Add the files to the root directory of your web server<br>
2) Create a schema on your MySQL server and execute the SQL script found in database_dump on the schema<br>
3) Tables will now be created in the DB, check out the 'authorization' table, add* two passwords - one with level 1 and one with level 2 
4) Edit functions get_db_connection and get_schema_name in models/db.php - DB servername, username, password and schema name needs to be specified<br>
5) The server should now work, you can access it via booking_system.php (serverroot.com/booking_system.php)<br>
<br>
*this can be done with INSERT INTO `/schema name/`.`authorization` (`password`, `level`) VALUES ('/password/', /level/); where you replace the values in the / brackets with your own <br>
In case there are any problems and you are able to access the page, there should be a error dump in the browser console - check it out first.
<br><br>
To update to version 1.1:<br>
1) Run the SQL script from database_dump/db_migration.txt<br>
2) update the rest of the files except models/db.php<br>
<br>
Version 1.13:<br>
-Added Projects History; Projects now show only active projects<br>
-Header location is now fixed<br>
-Removed most grey or bright colors<br>
-Team filter now works in all categories<br>
To update to version 1.13:<br>
- override all files except for modesl/db.php<br>
