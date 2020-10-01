
# Script Runner

Ever feel tired of running multiple services all over again? 
Going one by one using `cd` or creating new new terminal for each service?

Fraid not!  This may will help you on that!

Script Runner is a CLI app to ease you running multiple recurring services with only **one command**.

You can set predefined ***config*** that containing all services to be executed.

## Setup

    git clone <this_repo>
    yarn
    yarn link

Test the CLI, by entering this

    runner

It should output available commands. We'll go through them later.
![Command list](https://i.ibb.co/SPSYTCk/image.png)

## Services
All of your services will be placed inside `data/services.json`. It is saved in object with each service saved in format `<service_name>:<path_to_service>`.

Example:

    {
	    "dora": "/home/work/dora",
	    "auth": "/home/work/auth",
	    ...
    }

## Config
All of your configs will be placed inside `data/config/<config_name>.json`. It is saved in array with each item contains the `service_name` as you defined in `services.json` and its list of commands to run.

Example:

    [
	    {
		    "service": "dora",
		    "command_to_run": ["yarn build", "yarn dev"]
	    },
	    {
		    "service": "auth",
		    "command_to_run": ["yarn start"]
	    }
    ]

Things to be noticed are:
 - Each service will be run in new terminal tab.
 - Each item in `command_to_run` will run in sequence.

> If you just want to open service in a new terminal tab, put empty array in command_to_run ( [] )


## CLI Commands

The CLI command is there to help you running and managing the configs and services. You can use `-h` or `--help` on each command to see available options.

**run | r <config_name>**

Run specified config.

    runner run webpage

It will run `data/config/webpage.json`. Services are run on a new terminal tab.

![Services are run on a new tab](https://i.ibb.co/nRwCTtT/image.png)

**list-config | lc**

List available configs. It reads `data/config/*` folder.

**list-services | ls**

List available services and its respective path. It reads `data/services.json` folder.

**add-config | ac**

It will prompt you series of question to create a new config. 

> You can also directly add new config on `data/config` folder.

**add-service | as**

It will prompt you series of question to create a new service. There are 3 ways you can add service.

 1. Add from folder: Choose folder of the service. It will use folder name as the service name.
 2. Add multiple from folder: Choose root folder of the services you want to add. It will add all folders inside the folder you choose.
 3. Add path manually: You will be prompted to enter service's name and path manually. 

> You can set directory picker base path by setting `DIRECTORY_PICKER_BASE_PATH` on `.env`. By default is this project's root folder.

**edit [options]**

Edit config/service in a editor.

|Option| Description | Default |
|--|--|--|
| `-c`, `--config`  \<config_name\> | Edit config | | 
| `-s`, `--service`  | Edit service | |
| `-e`, `--editor`  | Pick editor path | Ubuntu/MacOS: nano, Windows: notepad|

> You can override default editor by setting`DEFAULT_EDITOR` on `.env`. 

**delete [options]**

Delete config/service.

|Option| Description | Default |
|--|--|--|
| `-c`, `--config`  \<config_name\> | Delete specified config | | 
| `-s`, `--service` \<service_name\> | Delete specified service | |

**stop | s \<config_name\>**

It will stop all services specified in the config.

**force-stop | fs [process_name]**

Force stop all processes with name as `process_name`. If `process_name` is not defined, it will kill all `node` processes.

