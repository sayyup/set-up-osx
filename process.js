const read = require('read')
const chalk = require('chalk')
const output = require('./output')
const fs = require('fs')
const exec = require('child_process').exec
const sudo = require('sudo-prompt')

// TODO fix
var sudoOptions = {
  name: 'Ronomon',
  //icns: '/path/to/icns/file', // (optional)
  onChildProcess: function (childProcess) {} // (optional)
}

let settings = {}

// ensure that input, while not needed, is ignored
process.stdin.on('readable', function () {
  // TODO does not work with executable items...
  var chunk = process.stdin.read()
  if (chunk !== null) {
    process.stdout.write(chunk)
  }
})

const feedback = (error, result, isDefault) => {
  if (result.toLowerCase() === 'y') {
    output.done(settings.tasks[settings.current].id)
  } else if (error) {
    output.fail(settings.tasks[settings.current].id, error.message)
  } else {
    output.fail(settings.tasks[settings.current].id, 'refused')
  }
  output.print()

  // proceed to next step
  next()
}

const end = () => {
  // ended, so output thank you
  output.print(true)
  process.exit(0)
}

const next = () => {
  settings.current++

  if (settings.current < settings.tasks.length) {
    execute()
  } else {
    end()
  }
}

// looping function until the end
const execute = () => {
  let item = settings.tasks[settings.current]
  let exists = false
  if (item.check) {
    // check if file path exists
    exists = fs.existsSync(item.check)
  }
  output.store(settings.current, item.category, item.note, item.subtasks, item.comments, item.url)

  if (exists) {
    // already exists, so proceed to next step
    output.done(item.id)
    next()
  } else if (item.execute) {
    // execute a script
    // TODO prints passwords? -> stdin is incorrectly set? => https://www.npmjs.com/package/sudo or https://www.npmjs.com/package/sudo-prompt
    output.print()
    output.wait()

    console.log('-----',item.execute)

    if (item.execute.indexOf('sudo') !== -1) {
      // task needs sudo-rights
      sudo.exec('echo hello', sudoOptions, function (error, stdout, stderr) {
        if (error) {
          output.fail(item.id, error.message)
        } else {
          output.done(item.id)
        }
        next()
      })
    } else {
      // just execute the task and wait for reply
      exec(item.execute, function (error, stdout, stderr) {
        if (error) {
          output.fail(item.id, error.message)
        } else {
          // TODO if password: than listen to stdout? (sudo-issues)
          output.done(item.id)
          console.log('stdout: ' + stdout)
          console.log('stderr: ' + stderr)
        }
        next()
      })
    }

  } else {
    // does not exist, so listen to feedback
    output.print()

    read({prompt: chalk.bgGreen.white.bold(' ' + (settings.current + 1) + '/' + settings.tasks.length+' ') + chalk.inverse(' ' + settings.prompt)}, feedback)
  }
}

module.exports = function (value) {
  settings.prompt = value.prompt
  settings.tasks = value.tasks
  settings.current = 0

  execute()

  return {}
}
