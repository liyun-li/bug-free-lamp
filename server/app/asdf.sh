#!/bin/sh

sqlite3 app.db -header -column 'select * from message;'
