FROM mysql:{{MYSQL_VERSION}}

# Bake the config into the image: a bind-mounted my.cnf from Windows is
# world-writable and MySQL silently ignores it.
COPY my.cnf /etc/mysql/conf.d/zz-custom.cnf
RUN chmod 644 /etc/mysql/conf.d/zz-custom.cnf \
    && mkdir -p /var/lib/mysql-logs /var/lib/mysql-files \
    && chown mysql:mysql /var/lib/mysql-logs /var/lib/mysql-files

# The logs folder (mounted from mysql/logs) is given to MySQL on every start: see entrypoint.sh
COPY entrypoint.sh /usr/local/bin/dcs-entrypoint.sh
RUN chmod 755 /usr/local/bin/dcs-entrypoint.sh
ENTRYPOINT ["dcs-entrypoint.sh"]
CMD ["mysqld"]
