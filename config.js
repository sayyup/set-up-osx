/**
 * Process configuration and output tasks to execute.
 *
 * @returns {{}}
 */

const fs = require('fs')

module.exports = function (args) {
  // process arguments & populate object
  let configuration = {}
  let currentParam = ''
  let i = 0
  let il = args.length
  while (i < il) {
    let param = args[i]
    if (param.indexOf('--') !== -1) {
      // setting found
      configuration[param.replace('--', '')] = ''
      currentParam = param.replace('--', '')
    } else if (currentParam !== '') {
      // add value
      configuration[currentParam] = param
    }
    i++
  }

  // add tasks
  if (args.length > 0 && args[0].indexOf('--') === -1) {
    // tasks are defined
    let path = args[0]
    if (path.indexOf('/') === -1) {
      // current directory
      path = __dirname + '/' + path
    }
    configuration.path = path

    let data
    try {
      data = JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (e) {
      // TODO what to do?
    }
    if (data && data.steps) {
      // add ids for later use by output.js
      let steps = []
      let lastCategory = ''
      for (let value in data.steps) {
        let item = data.steps[value]
        if (item.category && lastCategory !== item.category) {
          // new category found
          lastCategory = item.category
        } else {
          item.id = steps.length
          item.category = lastCategory || ''
          if (item.check && item.check.indexOf('{*}') !== -1) {
            // adjust path correctly, useful when users can change
            item.check = item.check.replace(/\{\*\}/g, configuration.user)
          }
          if (item.execute && item.execute.indexOf('{*}') !== -1) {
            item.execute = item.execute.replace(/\{\*\}/g, configuration.user)
          }
          if (item.subtasks === undefined) {
            item.subtasks = []
          }
          if (item.comments === undefined) {
            item.comments = []
          }
          if (item.url === undefined) {
            item.url = ''
          }
          steps.push(item)
        }
      }

      // data is in correct format, so embed
      configuration.tasks = steps
    }
  }

  // add prompt sign
  configuration.prompt = 'Done? (y/n)'

  return configuration
}
