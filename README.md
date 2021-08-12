# ropto-tech-test

# Set up the mysql docker container
You can either use your own database instance or create a new one from scratch using docker.

Create the container (choose a root password):
`sudo docker run --name ropto-mysql -e MYSQL_ROOT_PASSWORD=<password> -d mysql:5.7`

Shell into the container:
`sudo docker exec -it ropto-mysql bash`

Run mysql as the root user:
`mysql -u root -p`

Create the ropto database:
`CREATE DATABASE ropto;`
`USE ropto;`

Create the Stories table:
`CREATE TABLE Stories (
    storyID int NOT NULL,
    deleted varchar(255) DEFAULT NULL, 
    type varchar(255) DEFAULT NULL,
    username varchar(255) DEFAULT NULL,
    time int DEFAULT NULL,
    text varchar(5000) DEFAULT NULL,
    dead varchar(255) DEFAULT NULL,
    parent int DEFAULT NULL,
    poll varchar(255) DEFAULT NULL,
    kids varchar(255) DEFAULT NULL,
    url varchar(255) DEFAULT NULL,
    score int DEFAULT NULL,
    title varchar(255) DEFAULT NULL,
    parts varchar(255) DEFAULT NULL,
    descendants int DEFAULT NULL
);`

Allow utf8 characters:
`ALTER TABLE ropto.Stories CONVERT TO CHARACTER SET utf8;`

# Install
`npm install`

# Configure 
Copy the file `.env.example` to `.env` and fill in the fields with the details necessary to connect to your chosen mysql instance.

# Run
`npm run start`

## Trigger app to save the top 500 stories and their child stories
Use postman or curl:

`curl --header "Content-Type: application/json" \
  --request GET \
  http://localhost:3001/saveTopStories
`
