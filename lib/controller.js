
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const inquirer = require("inquirer");
const colors = require("colors");
inquirer.registerPrompt('search-list', require('inquirer-search-list'));
inquirer.registerPrompt('directory', require('inquirer-select-directory'));

const QuestionName = require("./constants/questionName");
const {FINISH_FLAG} = require("./constants/flags");

const ConfigModel = require('./model/Config').getInstance();
const ServiceModel = require('./model/Service').getInstance();
const { listDir, deletePath, line, success, error } = require('./util');


const {
    askConfigNameQuestion, 
    askNewServiceQestion, 
    askServiceSetup,
} = require('./questions');

async function addNewService() {
    const ans = await askNewServiceQestion();

    const currentServices = ServiceModel.loadData();

    if (ans[QuestionName.ADD_SERVICE_METHOD] === 'multiple_from_folder') {
        return await addServiceFromPath(ans[QuestionName.PATH], true, ans[QuestionName.SAVE_TYPE] === 'override')
    } else if (ans[QuestionName.ADD_SERVICE_METHOD] === 'add_manually') {
        const newServices = {
            ...currentServices,
            [ans[QuestionName.SERVICE_NAME]]: ans[QuestionName.PATH],
        }
        return ServiceModel.saveData(newServices)
    } else if (ans[QuestionName.ADD_SERVICE_METHOD] === 'from_folder') {
        return await addServiceFromPath(ans[QuestionName.PATH])
    }

}

async function promptAddNewConfig() {
    try {
        let result = await askConfigNameQuestion();

        line();
        console.log(colors.yellow(`Choose ${colors.bold(FINISH_FLAG)} to end adding service`))
        const commands = [];
        let ans = '';
        do {
            line();
            ans = await askServiceSetup();

            if (ans[QuestionName.SERVICE_NAME] !== FINISH_FLAG) {
                commands.push({
                    service: ans[QuestionName.SERVICE_NAME],
                    command_to_run: ans[QuestionName.COMMAND_TO_RUN].split(';').map(c => c.trim())
                })
            }

        } while (ans[QuestionName.SERVICE_NAME] !== FINISH_FLAG);

        ConfigModel.saveData(result[QuestionName.CONFIG_NAME], commands)
        return success();
    } catch (e) {
        return error(e)
    }
}


function runConfig(data) {
    try {
        const serviceConfig = ServiceModel.loadData();
        data.forEach(item => {
            const name = item.service;
            let command_to_run = "";
            if (item.command_to_run.length > 0) {
                command_to_run = `'${item.command_to_run.join(" && ")}'`;
            }

            execSync(`ttab -t '${name}' -d ${serviceConfig[name]}\ ${command_to_run}`,
                {
                    detached: true,
                    stdio: 'ignore'
                });
        })
        return success();
    } catch (e) {
        return error(e);
    }
}

function kill(pid) {
    try {
        console.log(`Killing Process : ${pid}`);
        process.kill(pid, 'SIGKILL');
    } catch (e) {
        console.log(`Invalid Process ID:${pid}, failed during kill, "ERROR: ${e}"`);
    }
}

function sanitizePath(path) {
    return path.replace(/\/$/, "")
}

function readServicePath(service_path) {
    try {
        const freeTrailingSlashPath = sanitizePath(service_path);
        // const packageJsonPath = path.resolve(freeTrailingSlashPath, 'package.json')
        // const packageJson = require(packageJsonPath);
        var n = freeTrailingSlashPath.lastIndexOf('/');
        var result = freeTrailingSlashPath.substring(n + 1);
        return success({
            defaultName: result,
            sanitizedPath: freeTrailingSlashPath,
        })
    } catch (e) {
        return error(e);
    }
}

function saveService(name, path) {
    try {
        const currentServiceList = ServiceModel.loadData();
        currentServiceList[name] = sanitizePath(path);
        ServiceModel.saveData(currentServiceList);
        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false
        }
    }
}

function addServiceFromPath(path, recursive = false, override = false) {
    try {
        const currentServiceList = ServiceModel.loadData();
        if (recursive) {
            const listFolder = listDir(path);
            const newServices = listFolder.reduce((newServices, folder) => {
                const { data: {defaultName, sanitizedPath} } = readServicePath(folder);
                newServices[defaultName] = sanitizedPath;
                return newServices;
            }, {});
            if (override) {
                ServiceModel.saveData(newServices);
            } else {
                ServiceModel.saveData({ ...currentServiceList, ...newServices });
            }
        } else {
            const { data: {defaultName, sanitizedPath} } = readServicePath(path);
            currentServiceList[defaultName] = sanitizePath(sanitizedPath);
            ServiceModel.saveData(currentServiceList);
        }
        return success();
    } catch (e) {
        return error(e)
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    run: runConfig,
    runFromConfig: function (configName) {
        const data = ConfigModel.loadData(configName);
        return runConfig(data);
    },
    forceKill: function (process_name) {
        const processToKill = typeof process_name === 'string' ? process_name : 'node';
        const res = execSync(`killall -9 ${processToKill}`);
        return success(res.toString());
    },
    stopConfig: async function (configName) {
        const data = ConfigModel.loadData(configName);
        data.forEach(sv => {
            console.log(sv.service)
            const res = execSync(`ps aux | grep ${sv.service} | awk '{print $2}' | xargs -n1`);
            let allPIDs = res.toString().split('\n').map(pid => pid.replace(/\s/, '')).filter(pid => pid.trim() !== '') || undefined;
            if (allPIDs.length > 0) {
                allPIDs.forEach(async pid => {
                    if (!isNaN(pid)) {
                        kill(pid);
                        await sleep(2000);
                    } else {
                        console.log(`ERROR: Invalid Process ID : ${pid}, Skipped Kill `);
                    }
                });
            }
        })
        return success();
    },
    promptAddNewConfig,
    addNewService,
    getListConfig: function () {
        const configList = ConfigModel.listData();
        const configWithItsService = configList.reduce((data, configName) => {
            const configInfo = ConfigModel.loadData(configName);
            data[configName] = configInfo.map(service => ({
                ...service,
                active: true,
            }));
            return data;
        }, {})
        return configWithItsService;
    },
    getListConfigArray: function () {
        const configList = ConfigModel.listData();
        return configList.map(config => ({
            "Config name": config,
        }));
    },
    getServicesAsArray: function () {
        try {
            const services = ServiceModel.loadData();
            const serviceNames = Object.keys(services);
            return success(serviceNames.map(serviceName => {
                const servicePath = services[serviceName];
                return {
                    'Service Name': serviceName,
                    'Service Path': servicePath,
                }
            }));
        } catch (e) {
            return error(e)
        }
    },
    saveConfig: function (name, config) {
        try {
            ConfigModel.saveData(name, config);
            return success()
        } catch (e) {
            return error(e)
        }
    },
    saveService,
    readPath: readServicePath,
    addServiceFromPath,
    editFromEditor: function (args) {
        let filePath = '';
        if (args.service) {
            filePath = path.resolve(__dirname, '../data/services.json');
        } else if (args.config) {
            filePath = path.resolve(__dirname, `../data/config/${args.config}.json`);
        }

        const platform = process.platform;

        let editor = '';
        if (platform === 'win32') {
            editor = 'C:\\windows\\notepad.exe';
            if (args.editor) {
                editor = args.editor;
            } else if (process.env.DEFAULT_EDITOR) {
                editor = process.env.DEFAULT_EDITOR;
            }
        } else {
            editor = 'nano';
            if (args.editor) {
                editor = args.editor;
            } else if (process.env.DEFAULT_EDITOR) {
                editor = process.env.DEFAULT_EDITOR;
            }
        }
        execSync(`${editor} "${filePath}"`, { stdio: 'inherit' })
    },
    deletePath: function (args) {
        if (args.service) {
            const currentServiceList = ServiceModel.loadData();
            delete currentServiceList[args.service]
            ServiceModel.saveData(currentServiceList);
        } else if (args.config) {
            const filePath = path.resolve(__dirname, `data/config/${args.config}.json`);
            deletePath(filePath)
        }

    }
}