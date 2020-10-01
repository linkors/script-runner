
const inquirer = require("inquirer");
const ServiceModel = require('../model/Service').getInstance();
const QuestionName = require("../constants/questionName");
const {FINISH_FLAG} = require("../constants/flags");

const services = ServiceModel.loadData();
const choices = [FINISH_FLAG, ...Object.keys(services)];

module.exports = async function askServiceSetupQuestion () {
    return inquirer.prompt([
        {
            type: 'search-list',
            name: QuestionName.SERVICE_NAME,
            message: 'Choose service (you can type to quick select) ',
            choices,
        },
        {
            type: 'input',
            name: QuestionName.COMMAND_TO_RUN,
            message: 'Command to run (separated by ";")',
            when: ans => ans[QuestionName.SERVICE_NAME] !== FINISH_FLAG
        },
    ])

} 