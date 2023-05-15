# deploy-cli

deploy-cli is a command-line tool that allows you to deploy your frontend build files to a server. The tool consists of three steps:

1. Run the `deploy-cli init` command to create a .env.deploy file.

2. Edit the `.env.deploy` file to configure the necessary environment variables, such as the server's SSH credentials and the path to the deployment directory.

3. Run the `deploy-cli` command to deploy your frontend build files to the server.

