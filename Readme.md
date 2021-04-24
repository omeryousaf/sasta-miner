### To run the project
1. make sure the following prereq tools are installed on the host machine:
    1. Nodejs
    2. Yarn
2. open terminal and navigate to the project folder, and then
3. run `yarn install`
4. run `yarn serve`
5. open `http://localhost:8080` in your browser

### To deploy
1. pull the repo on the remote machine
2. run `pm2 start yarn --interpreter bash --name sasta -- serve`
