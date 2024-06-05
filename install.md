## INSTALL MEANDRE

### 1. UPDATE AND UPGRADE YOUR SERVER
Copy the env file from the default one
``` sh
cp install.env .env
```
Fill this env file with your info.
**WARNING : KEEP THE .ENV FILE FOR YOU. DO NOT EXPOSE IT.**

Connect to you VM with
``` sh
ssh $SERVER_USER@$SERVER_IP
```
And register with you password

Change password on new VM
``` sh
passwd
```

Update apt
``` sh
sudo apt update
sudo apt upgrade -y
```

Create file for auto login and paste your local ssh id_rsa.pub in that file
``` sh
nano .ssh/authorized_keys
```


### 2. INSTALL APACHE
``` sh
sudo apt install apache2 python3-certbot-apache -y
sudo systemctl enable apache2
sudo systemctl start apache2
```


### 3. INSTALL POSTGRESQL
#### On local computer
Save the database and export it to server
``` sh
source .env
pg_dump -U $DB_USER -F c -b -v -f $DB_NAME.backup $DB_NAME
scp $DB_NAME.backup $SERVER_USER@$SERVER_IP:~/
```

#### On remotes server
Create user and database and update it with the local backup
``` sh
source .env
sudo apt install postgresql postgresql-contrib libpq-dev -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql -U postgres -c "CREATE DATABASE '${DB_NAME}';"
sudo -u postgres psql -U postgres -c "CREATE USER '${DB_USER}' WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE '${DB_NAME}' TO '${DB_USER}';"
pg_restore -U $DB_USER -d $DB_NAME -v ~/$DB_NAME.backup
```


### 4. INSTALL PYTHON
``` sh
sudo apt install python3 python3-pip -y
sudo pip install flask sqlalchemy flask-cors psycopg2 numpy subprocess json os datetime pandas dotenv
```


### 5. INSTALL R
``` sh
sudo apt install -y r-base
sudo Rscript -e 'install.packages(c("argparse", "jsonlite", "remotes")); remotes::install_github("super-lou/dataSHEEP")'
```


### 6. CONFIGURE FLASK APP
Source info and install dependency
``` sh
source .env
sudo apt install libapache2-mod-wsgi-py3
```

Create the Apache configuration file
``` sh
sudo bash -c "cat > /etc/apache2/sites-available/MEANDRE.conf <<EOF
<VirtualHost *:80>
    ServerName $SERVER_IP
    ServerAdmin $SERVER_EMAIL

    WSGIDaemonProcess MEANDRE python-path=/usr/lib/python3/dist-packages
    WSGIProcessGroup MEANDRE
    WSGIScriptAlias / $SERVER_DIR/app.wsgi

    <Directory $SERVER_DIR>
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/MEANDRE_error.log
    CustomLog \${APACHE_LOG_DIR}/MEANDRE_access.log combined
</VirtualHost>
EOF"
```

Enable the new site and mod_wsgi module
``` sh
sudo a2ensite MEANDRE
sudo a2enmod wsgi
```

Restart Apache and certbot for HTTPS
``` sh
sudo systemctl restart apache2
sudo certbot --apache
```