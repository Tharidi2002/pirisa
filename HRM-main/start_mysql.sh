#!/bin/bash
set -e
DATADIR="$HOME/mysql_data"
SOCKET_PATH="$PWD/tmp/mysql.sock"
mkdir -p "$(dirname "$SOCKET_PATH")"

if [ ! -d "$DATADIR/mysql" ]; then
    echo "Initializing MySQL data directory..."
    mkdir -p "$DATADIR"
    mysqld --initialize-insecure --user="$USER" --datadir="$DATADIR"
fi
echo "Starting MySQL server..."
mysqld --datadir="$DATADIR" --user="$USER" --skip-networking=0 --socket="$SOCKET_PATH" &
echo "Waiting for MySQL to start..."
sleep 2
timeout 30s bash -c "until mysqladmin ping --socket=$SOCKET_PATH --silent; do sleep 1; done"
echo "Configuring MySQL..."
mysql --socket="$SOCKET_PATH" -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Ijse@123'; CREATE DATABASE IF NOT EXISTS HRM;"
echo "MySQL is ready."
