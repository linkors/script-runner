const { lstatSync, readdirSync } = require('fs')
const colors = require("colors");
const { join } = require('path')

function line () {
  console.log("\n-----------------------------------\n")
}

module.exports = {
  listDir: function (path) {
    const isDirectory = source => lstatSync(source).isDirectory()
    const getDirectories = source =>
      readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    return getDirectories(path)
  },
  deletePath: function (path) {
    if (!path || path === '/') {
      throw new Error('Please specify a path');
    }
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file, index) => {
        const curPath = Path.join(path, file);
        if (!curPath.includes(__dirname)) {
          throw new Error('Please specify appropriate path');
        }
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  },
  validator: function (validations) {
    return value => {
      let result = true;
      if (validations.required) {
        result = !!value ? true : 'Please fill this input!';
      }
      return result;
      }
    },
    line,
    printResult: function (result, successMessage = "Success!") {
      line();
      if (result.success) {
        console.log(colors.green(successMessage))
      } else {
        console.log(colors.red(result.error || "Something is wrong!"));
      }
      line();
    },
    success: function(data) {
      return {
        success: true,
        data,
      }
    },
    error: function(err) {
      return {
        success: false,
        error: err,
      }
    }
}