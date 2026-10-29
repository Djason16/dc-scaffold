FROM php:{{PHP_VERSION}}-apache

# PHP extensions and Apache modules (OPcache is built into PHP since 8.5: installed only before)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd intl mysqli pdo_mysql zip $(php -m | grep -qi 'zend opcache' || echo opcache) \
    && a2enmod rewrite headers \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Xdebug + Redis
RUN pecl install xdebug redis \
    && docker-php-ext-enable xdebug redis

# Composer available inside the container
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Xdebug (mode driven by the XDEBUG_MODE env var)
RUN { \
    echo "xdebug.client_host=host.docker.internal"; \
    echo "xdebug.client_port=9003"; \
    echo "xdebug.start_with_request=trigger"; \
    } > /usr/local/etc/php/conf.d/zz-xdebug.ini

# OPcache
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.memory_consumption=256"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.max_accelerated_files=20000"; \
    echo "opcache.validate_timestamps=1"; \
    echo "opcache.revalidate_freq=1"; \
    echo "opcache.jit=tracing"; \
    echo "opcache.jit_buffer_size=128M"; \
    echo "opcache.enable_cli=1"; \
    } > /usr/local/etc/php/conf.d/zz-opcache.ini

EXPOSE 80
