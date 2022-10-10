# pianoes

CS5647 Project: A piano evaluation system for learning

# To run both server and client using Docker

1. In the 'pianoes' folder, run `docker-compose up`
2. Ensure that 'node_modules' has been created under 'client' folder, else run `docker-compose down` to remove images and containers, and run `npm install`, then run `docker-compose up`.
3. Wait and open [http://localhost:3000](http://localhost:3000) to view it in your browser once it is ready.

## Debugging

### Ubuntu

If docker build process is throwing this error:  
`WARNING: Retrying (Retry(...)) after connection broken by 'NewConnectionError('<pip._vendor.urllib3.connection.HTTPSConnection object at 0x...>: Failed to establish a new connection: [Errno -3] Temporary failure in name resolution')`

Then follow these steps:

1. Log into Ubuntu as a user with sudo privileges.
2. Open the `/etc/default/docker` file for editing:  
   `$ sudo nano /etc/default/docker`

3. Add the following setting for Docker.  
   `DOCKER_OPTS="--dns 8.8.8.8"`
4. Save and close the file.
5. Restart the Docker daemon:  
   ` $ sudo systemctl restart docker` or `$ sudo service docker restart`

# Commit to Github

1. git pull (to get latest version)
2. git add . ( if you create a new file )
3. git commit -m "type a description"
4. git checkout -b "branch name"
5. gh pr create ( to create pull request )
