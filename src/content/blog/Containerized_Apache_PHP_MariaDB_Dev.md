---
title: "Containerized Apache, PHP and MariaDB development environment"
# categories: [ "System Administration" ]
pubDate: 2022-05-29
tags: [ "Podman", "Apache", "PHP", "MariaDB", "Ubuntu"]
---

There are at least a few cases when installing the full Apache, PHP and MariaDB is not a convenient option:

- developing a single project or just a few number of them
- testing a project with multiple versions of Apache, PHP and MariaDB
- having a HTTP server or a database configured for development running all the time may be a security issue 

## Quick start

### Project structure

There are three directories:

- `scripts` for initializing the database
- `database` for the database files
- `web` for all other files

The project will be available at [http://localhost:8080](http://localhost:8080)

### The containers

Download official containers:

```sh
podman pull docker.io/library/mariadb:latest
podman pull docker.io/library/php:8.1-apache
```

### The pod

Create a pod with the official containers (you should change `dbRoot` to a stronger password):

```sh
podman pod create --name camp --publish 8080:80 --publish 3306:3306

podman run --detach --pod camp --name database \
    --env MARIADB_ROOT_PASSWORD=dbRoot \
    --volume "$PWD"/database:/var/lib/mysql:Z \
    mariadb:latest

podman run --detach --pod camp --name webnphp \
    --volume "$PWD"/web:/var/www/html:Z \
    php:8.1-apache
```

Make sure `pdo` and `pdo_mysql` PHP modules are installed (`php:8.1-apache` does not have `pdo_mysql` installed by default). To add them, execute:

```sh
# install pdo_mysql then restart apache
podman exec webnphp /bin/bash -c 'docker-php-ext-install pdo pdo_mysql; apache2ctl restart'
# check installed PDO modules for PHP
podman exec webnphp /bin/bash -c 'php -m | grep -i pdo'
```

**Alternatively**, connect to the container with

```sh
podman exec -it webnphp /bin/bash
```

and install the missing module by running inside the container:

```sh
docker-php-ext-install pdo pdo_mysql
apache2ctl restart
php -m | grep -i pdo
exit
```

**Note:** you could check the installed PHP modules by running `php -m` or `php -i` inside the container.

### Create the database

If you have a script to create your database, let's say `scripts/createDatabase.sql`, you can use a container to create your database:

```sh
podman run -it --rm --pod camp \
    --volume "$PWD"/scripts:/root/scripts:Z \
    mariadb:latest mysql -h 127.0.0.1 --user="root" --password="dbRoot" --execute='source /root/scripts/createDatabase.sql'
```

**Alternatively** you can use a container to create the database:

```sh
podman run -it --rm --pod camp \
    mariadb:latest mysql -h 127.0.0.1 -u root -p
```

by running **your** version of this `createDatabase.sql` script in `mysql`'s prompt:

```sql
create database MyTestDatabase;
grant all privileges on MyTestDatabase.* TO 'dbUser'@'localhost' identified by 'dbPass';
grant all privileges on MyTestDatabase.* TO 'dbUser'@'%' identified by 'dbPass';
flush privileges;
quit;
```

### Initialize the database content

If you have a script to initialize your database, let's say `scripts/initializeDatabase.sql`, you can use a container to initialize your database:

```sh
podman run -it --rm --pod camp \
    --volume "$PWD"/scripts:/root/scripts:Z \
    mariadb:latest mysql -h 127.0.0.1 \
        --user='dbUser' \
        --password='dbPass' \
        --database='MyTestDatabase' \
        --execute='source /root/scripts/initializeDatabase.sql'
```

### Working with the database

To work with your database you can use a container with MySQL client started as `dbUser`:

```sh
podman run -it --rm --pod camp \
    mariadb:latest mysql -h 127.0.0.1 -u dbUser -p
```

and manually input commands or you can launch a container with a bind mount to the `scripts` directory:

```sh
podman run -it --rm --pod camp \
    --volume "$PWD"/scripts:/root/scripts:Z \
    mariadb:latest mysql -h 127.0.0.1 \
        --user='dbUser' \
        --password='dbPass' \
        --database='MyTestDatabase' \
```

and execute SQL scripts from that directory like:

```sql
source /root/scripts/initializeDatabase.sql
```

### Utils

See the logs generated by those containers with:

- `podman logs webnphp`
- `podman logs database`

To start, stop, restart or remove the pod use:

- `podman pod start camp`
- `podman pod stop camp`
- `podman pod restart camp`
- `podman pod rm camp`

**Short note** about bind mount and SELinux labeling:

- use `:z` when the volume will be used by multiple containers in parallel.
- use `:Z` to bind the volume only to one container. If you attach it to multiple containers only the last one will be able to access it.
