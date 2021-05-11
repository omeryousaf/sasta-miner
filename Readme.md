### To run the project
1. make sure the following prereq tools are installed on the host machine:
    1. Nodejs
    2. Yarn
2. open terminal and navigate to the project folder, and then
3. run `yarn install:deps`
4. run `yarn build`
5. run `node server/app.js`
5. open `http://localhost:3000` in your browser

### To deploy
1. pull the repo on the remote machine
2. add config.js file inside server/ folder
3. run `yarn install:deps`
4. run `yarn build`
5. run `pm2 start server/app.js`
6. open `http://<remote_server_ip>:3000`

## To run unit tests
1. run `yarn test:server`