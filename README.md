# booking_system
To make this work:
1)Add the files to the root of your web server directory
2)Create a schema on your MySQL server and execute the SQL script found in database_dump on the schema
3)Tables will now be created in the DB, check out the 'authorization' table, add two passwords - one with level 1 and one with level 2
4)Edit functions get_db_connection and get_schema_name - DB servername, username, password and schema name needs to be specified
5)The server should now work, you can access it via booking_system.php (serverroot.com/booking_system.php)

In case there are any problems and you are able to access the page, there should be a error dump in the browser console - check it out first.
