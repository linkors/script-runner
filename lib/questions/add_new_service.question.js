
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const inquirer = require("inquirer");
const { validator } = require('../util');
inquirer.registerPrompt('directory', require('inquirer-select-directory'));
const ServiceModel = require('../model/Service').getInstance();
const QuestionName = require("../constants/questionName");

const servicesExists = Object.keys(ServiceModel.loadData()).length > 0;

module.exports = async function askNewServiceQuestion () {
    return inquirer.prompt([
        {
            type: 'list',
            name: QuestionName.ADD_SERVICE_METHOD,
            message: 'How do you want to add?',
            choices: [
                {
                    name: 'Add from folder',
                    value: 'from_folder',
                },
                {
                    name: 'Add multiple from folder',
                    value: 'multiple_from_folder',
                },
                {
                    name: 'Add Path Manually',
                    value: 'add_manually',
                }
            ]
        },
        {
            name: QuestionName.SAVE_TYPE,
            type: 'list',
            message: 'Do you want to append or override?',
            default: servicesExists ? '' : 'override',
            choices: [
                'append', 
                'override',
            ],
            when: ans => servicesExists && ans[QuestionName.ADD_SERVICE_METHOD] === 'multiple_from_folder',
        },
        {
            name: QuestionName.PATH,
            type: 'directory',
            message: 'Where is the service folder?',
            basePath: path.resolve(__dirname, process.env.DIRECTORY_PICKER_BASE_PATH || '../') ,
            when: ans => ans[QuestionName.ADD_SERVICE_METHOD] === 'from_folder' || (ans[QuestionName.ADD_SERVICE_METHOD] === 'multiple_from_folder'),
        },
        {
            name: QuestionName.SERVICE_NAME,
            type: 'input',
            message: 'Service name?',
            validate: validator({ required: true }),
            when: ans => ans[QuestionName.ADD_SERVICE_METHOD] === 'add_manually',
        },
        {
            name: QuestionName.PATH,
            type: 'input',
            message: 'Service path?',
            validate: validator({ required: true }),
            when: ans => ans[QuestionName.ADD_SERVICE_METHOD] === 'add_manually',
        }
    ])

} 