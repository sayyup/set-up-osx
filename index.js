const chalk = require('chalk')
const config = require('./config')
const tasks = require('./process')

// load all settings
const settings = config(process.argv.splice(2))

if (settings.tasks && settings.tasks.length > 0) {
  // process all tasks
  tasks(settings)
} else {
  console.error(chalk.red('Could not find any tasks, maybe a typo or invalid format. Check your JSON formatted configuration file: ' + settings.path))
  process.exit(0)
}
