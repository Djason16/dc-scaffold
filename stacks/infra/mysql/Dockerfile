FROM mysql:{{MYSQL_VERSION}}

# Bake the config into the image: a bind-mounted my.cnf from Windows is
# world-writable and MySQL silently ignores it.
COPY my.cnf /etc/mysql/conf.d/zz-custom.cnf
RUN chmod 644 /etc/mysql/conf.d/zz-custom.cnf \
    && mkdir -p /var/lib/mysql-logs /var/lib/mysql-files \
    && chown mysql:mysql /var/lib/mysql-logs /var/lib/mysql-files
