#!/usr/bin/env node

const { program } = require('commander');
const {printResult} = require('../lib/util');
const controller = require('../lib/controller')

program
    .command('run <config_name>') 
    .alias('r') 
    .description('Run Config') 
    .action(function (config_name) {
        printResult(controller.runFromConfig(config_name));
    });

program
    .command('list-config') 
    .alias('lc') 
    .description('List Config') 
    .action(function () {
        console.table(controller.getListConfigArray())
    });

program
    .command('list-service') 
    .alias('ls') 
    .description('List Service') 
    .action(function () {
        const result = controller.getServicesAsArray();
        if (result.success) {
            console.table(result.data)
        } else {
            console.log(result.error)
        }
    });

    program
    .command('add-config') 
    .alias('ac')
    .description('Add new config') 
    .action(async function () {
        const result = await controller.promptAddNewConfig();
        printResult(result);
    });

program
    .command('add-service') 
    .alias('as') 
    .description('Add new service') 
    .action(async function () {
        const result = await controller.addNewService();
        printResult(result)
    });

program
    .command('edit') 
    .option('-c, --config <config_name>', 'Edit config')
    .option('-s, --service', 'Edit service')
    .option('-e, --editor <editor_path>', 'Specify editor')
    .description('Edit service or config using text editor') 
    .action(function (args) {
        controller.editFromEditor(args);
    });

program
    .command('delete') 
    .option('-c, --config <config_name>', 'Delete config')
    .option('-s, --service <service_name>', 'Delete service')
    .description('Delete service or config') 
    .action(function (args) {
        controller.deletePath(args);
    });

program
    .command('stop <config_name>') 
    .alias('s') 
    .description('Stop Config') 
    .action(function (config_name) {
        printResult(controller.stopConfig(config_name));
    });

program
    .command('force-stop [process_name]') 
    .alias('fs') 
    .description('Force stop all process with specific name (default: node process)') 
    .action(function (process_name) {
            printResult(controller.forceKill(process_name));
    });


    program.parse(process.argv);



