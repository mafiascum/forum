FROM php:5.6.30-apache

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y imagemagick libpng-dev
RUN a2enmod rewrite
RUN docker-php-ext-install mysqli
RUN docker-php-ext-install gd

ADD . /var/www/html/

RUN mkdir -p /var/www/html/cache \
  && chmod 770 /var/www/html/cache \
  && chown www-data:www-data /var/www/html/cache
