# [ Local Development Environment Setup ]

## 0. [Download alliance-kumite source code]

0.1 Install git if its not yet instlled
0.2 Go to the directory where the project will reside `<project_dir>` and 
clone code from github repo:
```>git clone https://github.com/alliance-kumite/web.git```
<!-- 0.3 ftp to alliance-kumite.net and download 
```/home/alliance-kumite/resources/node_modules.zip```
0.4 Extract node_modules.zip to directory 
```><project_dir>/front/node_modules``` -->


## 1. [Cteate database]

1.0 ftp to alliance-kumite.net, download and extract
```/home/alliance-kumite/resources/alliance-kumite-dump-22-02-28.sql.zip```

1.1 (Optional)
Install MySql if it is not installed and then
run in shell
```>mysql -u root -p```
when mysql asks password hit enter for empty pwd
then in mysql shell run
```mysql> CREATE DATABASE karate_db;```

1.2 Open any mysql client and import db-dump-22-02-28.sql data


## 2. [python part]

2.1 Install python 3

2.2 Install pip
```
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

2.3 Download project backend dependencies
from `<project_dir>/back directory` run
```>pip install -r requirements.txt```

2.4. To run server from backend directory
```>sudo python3 manage.py runserver 80 ```


## 3. [angular part]

3.0 Install nodejs
https://nodejs.org/

3.0.1 Install Angular 
```>npm install -g @angular/cli``` 

3.0.2 Install project dependencies: go to frontend dir `<project_dir>/front` and run
```>npm install``` 


3.1. Go to frontend dir `<project_dir>/front` and run
```>ng serve```
<!-- может хотеть пароль админа чтоб зараниться -->

## 4. Open in browser: http://localhost:8000/

## 5. For development - vscode
https://code.visualstudio.com/download

With additional plugins is more convenient
Angular Essentials (Version 13)
Angular Language Service
Angular Snippets (Version 13)
Pylance
Python
GitLens - to see git changes


## 6. Additional

### 6.1 Settings of backend project are located in ```<project_dir>/back/backend/settings.py```

```
DEBUG = True
```

line 198 db settings 
```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'karate_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306'
    }
}
```

Replace ```<project_dir>``` by you local dev directory
```
APP_I18N_LOCATION = "<project_dir>/front/assets/i18n/"
```


### 6.2 Frontend settings 
#### 6.2.1 ```<project_dir>/front/src/environments/environment.local.ts```

```
export const environment = {
  production: false,
  serverApiUrl: 'http://localhost',
  mediaDir: '/assets/media'
};
```

## 7.1 On ```>sudo python3 manage.py runserver 80``` error try
```
    $ pip install django-cryptographic-fields

    Add then add "cryptographic_fields" to your INSTALLED_APPS setting like this:

INSTALLED_APPS = (
    ...
    'cryptographic_fields',
)

```


# [ Deployment to Production ]

## Backend / Python part

### ```<project_dir>/back/backend/settings.py```

```
DEBUG = False
```

```
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'karate_db',
        'USER': 'ak-user',
        'PASSWORD': 'slidfFHasjf',
        'HOST': '127.0.0.1',
        'PORT': '3306'
    }
}
```

```
APP_I18N_LOCATION = "/var/www/front/assets/i18n/"
```

### Copy source pyton files to production location on alliance-kumite.net
```alliance-kumite.net/var/www/back/```

### ssh to alliance-kumite.net and restart gunicorn
```sudo systemctl restart gunicorn```

## Frontend / Angular part

### cd to ```<project_dir>/front``` on your local dev mashine and run 
```sudo ng build --configuration production --output-hashing all```

### upload content of ```<project_dir>/front/dist/client``` to ```alliance-kumite.net/var/www/front``` directory

### ssh to alliance-kumite.net and restart nginx
```sudo systemctl restart nginx```

# Testing

### Running
From back directory
```python3 manage.py test```
or
```python3 manage.py test --keepdb```
```python3 manage.py test --noinput```


### Setting up tests
To generate test fixtures run from back dyrectory
python3 ./manage.py dumpdata --database=default backend --format=json --indent=4 > ./tests/fixtures/d.json



The testserver command allows you to run the development server, passing a fixture to load before it launches.
http://docs.djangoproject.com/en/dev/ref/django-admin/#testserver-fixture-fixture

This seems really nice, but the killer feature of this command is that it keeps the database around after you kill the development server. This means that you can load up a fixture, edit it in the admin or frontend, and then kill the server; then run dumpdata against that database and get your updated fixture back out. Pretty neat! Note, your normal database name will be prefixed with test_, so it doesn’t overwrite your normal DB. This is the one you want to get data out of. (You may have to define it in your settings.py file to get dumpdata to use it. This seems like a little bit of a hack, and maybe something could be done to make this easier.)
https://django-testing-docs.readthedocs.io/en/latest/fixtures.html



# Installing SSL certificate

### 1. Unzip 1691656595_A70LSW9XGF_alliance-kumite.net.zip locally 
### 2. Copy ```privkey.pem``` and ```fullchain.pem``` files to ```alliance-kumite.net``` server to ```/var/tmp``` directory using FileZilla
### 3. ```ssh alliance-kumite@84.246.80.119```
### 4. Type password
### 5. ```sudo mv /tmp/var/fullchain.pem /etc/ssl/certs/alliance-kumite-fullchain.pem```
### 6. Type password again if asks
### 7. ```sudo mv /tmp/var/privkey.pem /etc/ssl/private/alliance-kumite-privkey.pem```
### 8. ```sudo systemctl restart gunicorn```
