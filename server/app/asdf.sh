#!/bin/sh

sqlite3 app.db -header -column 'select * from user;'
echo
echo
echo
sqlite3 app.db -header -column 'select * from friendship;'
echo
echo
echo
sqlite3 app.db -header -column 'select * from message;'
