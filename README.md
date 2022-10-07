# pianoes

CS5647 Project: A piano evaluation system for learning

# To run both server and client using Docker

1. In the 'pianoes' folder, run `docker-compose up`
2. Ensure that 'node_modules' has been created under 'client' folder, else run `docker-compose down` to remove images and containers, and run `npm install`, then run `docker-compose up`.
3. Wait and open [http://localhost:3000](http://localhost:3000) to view it in your browser once it is ready.

# Commit to Github

1. git pull (to get latest version)
2. git add . ( if you create a new file )
3. git commit -m "type a description"
4. git checkout -b "branch name" 
5. gh pr create ( to create pull request )