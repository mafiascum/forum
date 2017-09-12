#!/bin/bash

curl -L https://www.mafiascum.net/downloads/ms_skeleton_latest.sql.tar.gz | tar -xz -C /tmp/
echo "CREATE DATABASE IF NOT EXISTS ms_phpbb3; USE ms_phpbb3;" | cat - /tmp/ms_phpbb3_skeleton.sql > /tmp/ms_phpbb3_fixed.sql
docker cp /tmp/ms_phpbb3_fixed.sql "$(docker-compose ps -q db)":/tmp/ms_phpbb3_fixed.sql
docker-compose exec db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < /tmp/ms_phpbb3_fixed.sql'