# MafiaScum Forum
This repo hosts the code used on https://forum.mafiascum.net

# With Docker Compose
This assumes you already have both Docker and Docker Compose installed.

## Setup
Copy `.env.sample` to `.env` and modify accordingly if this suits you.

## Running
```bash
# Start Services (web server and db)
docker-compose up

# Import the base schema (Do this on setup or if you want to reset)
# Ensure your mariadb container is running beforehand
./bootstrap_database.docker_compose.sh
```

## MariaDB Console
```bash
docker-compose exec db sh -c 'exec mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" $DB_NAME'
```

## Browse the forum
```
http://localhost:17080

(more accurately, http://<docker host>:17080)
Your <docker host> is probably localhost, unless you are using Docker Machine, and then it's the ip of your docker-machine VM
```


# With Docker (no Compose)
This assumes your already have Docker installed. If you don't, go find a guide for installing on the OS you're using (The official docs will likely be helpful here).

## Running

### MariaDB
You'll need an SQL server to point the forum at. I personally use [MariaDB](https://mariadb.org/), a fork of MySQL with some extra features. However, feel free to use MySQL instead here.
```bash
# Run the container
docker run -d --name mariadb -e MYSQL_ROOT_PASSWORD=examplepass mariadb:latest

# Import the base schema
curl -L https://www.mafiascum.net/downloads/ms_skeleton_latest.sql.tar.gz | tar -xz -C /tmp/
echo "CREATE DATABASE IF NOT EXISTS ms_phpbb3; USE ms_phpbb3;" | cat - /tmp/ms_phpbb3_skeleton.sql > /tmp/ms_phpbb3_fixed.sql
docker cp /tmp/ms_phpbb3_fixed.sql mariadb:/tmp/ms_phpbb3_fixed.sql
docker exec -it mariadb sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" < /tmp/ms_phpbb3_fixed.sql'
```

### Webserver
You'll probably also want to run the webserver too. This assumes you used the password 'examplepass' from the MariaDB example above. You'll need to change it if that isn't the case. Here are some examples, including how to change the password and the bound port:
```bash
# Build the webserver container
docker build -t mafiascum:localdev .

# Run the webserver container
docker run -d --name mafiascum -p 80:80 --link mariadb:mysql -e DB_HOST=mysql -e DB_PORT=3306 -e DB_NAME=ms_phpbb3 -e DB_USER=root -e DB_PASS=examplepass -e SITE_CHAT_URL=ws://localhost:4241 mafiascum:localdev

# Use the password 'differentpass' instead
docker run -d --name mafiascum -p 80:80 --link mariadb:mysql -e DB_HOST=mysql -e DB_PORT=3306 -e DB_NAME=ms_phpbb3 -e DB_USER=root -e DB_PASS=differentpass -e SITE_CHAT_URL=ws://localhost:4241 mafiascum:localdev

# Bind to 0.0.0.0:8080 instead
docker run -d --name mafiascum -p 8080:80 --link mariadb:mysql -e DB_HOST=mysql -e DB_PORT=3306 -e DB_NAME=ms_phpbb3 -e DB_USER=root -e DB_PASS=examplepass -e SITE_CHAT_URL=ws://localhost:4241 mafiascum:localdev
```

## Tips
A collection of useful commands to help you out while developing.

### MariaDB Access
Just run this command to get a MariaDB console as root.
```bash
docker run -it --link mariadb:mysql --rm mariadb sh -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
```

### Updating the Webserver
*Note: In addition to this method your text editor/IDE may include support for automatically running/building using Docker.*  
Run these commands to update the webserver container. Subsequent builds should be substantially faster than the first one because of how Docker caches layers.
```bash
docker rm -f mafiascum
docker build -t mafiascum:localdev .
```
Afterwards, just rerun it like you did the first time.

## Cleanup
You can remove both the containers by running:
```bash
docker rm -f mafiascum
docker rm -f mariadb
```

## Starting After Reboot
If you reboot your computer the docker containers **won't** come back up by default. Therefore, you'll need to start them like this:
```bash
docker start mariadb
docker start mafiascum
```

# Without Docker

## Running
You will need to run a MySQL server (Or equivalent, such as MariaDB) and Apache with PHP. Unfortunately, because of the wide variety of possible scenarios there is no canonical guide for installation. You may want to consider looking into WAMP/LAMP.

In general, your setup must:
- Include MySQL (Or equivalent), Apache 2, and PHP 5.6
- Have mod_rewrite installed and enabled
- Have the PHP extensions mysqli and gd installed and enabled
- Include a cache directory that is writable by the Apache process
- Include imagemagic and libpng-dev (Or equivalent)

## Adding Config
Simply add a `config.php` in this directory (It won't be committed, as it is in the `.gitignore`). See `config.php.docker` for an example.
