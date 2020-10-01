
const inquirer = require("inquirer");
const { validator } = require('../util');

const QuestionName = require("../constants/questionName");

module.exports = async function askConfigNameQuestion () {
    return inquirer.prompt([
        {
            type: 'input',
            name: QuestionName.CONFIG_NAME,
            message: 'Config name?',
            validate: validator({ required: true }),
        }
    ])

} 