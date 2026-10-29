#!/bin/sh
# Start of the MySQL container: mysql/logs/ of the project is mounted on /var/lib/mysql-logs.
# On Linux and macOS it belongs to the user of the computer, and MySQL (user "mysql") could not write
# its error log there and would stop: it is given to "mysql" first, then MySQL starts as usual.
chown -R mysql:mysql /var/lib/mysql-logs 2>/dev/null || true
exec docker-entrypoint.sh "$@"
