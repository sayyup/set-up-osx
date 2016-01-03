/**
 * Output current state to show the current progress of all the steps
 * @returns {}
 */

const chalk = require('chalk')

let list = []

const subList = (items, isTask) => {
  let s = 0
  let sl = items.length
  let symbol = '\u2610 '
  let endSymbol = ''
  if (!isTask) {
    symbol = '\u279D \u201C'
    endSymbol = '\u201D'
  }
  while (s < sl) {
    console.log(chalk.white('  ' + symbol + items[s] + endSymbol))
    s++
  }
}

const spaces = (value, length) => {
  if (value.length !== length) {
    value = value + '-'.repeat(length - value.length)
  }
  return value
}

module.exports = {
  // TODO fix with object (+validation)
  store: function (id, category, value, subtasks, comments, url) {
    list.push({
      id: id,
      category: category,
      note: value,
      subtasks: subtasks,
      comments: comments,
      url: url,
      done: false
    })
  },
  fail: function (id, reason) {
    // set incorrect
    let i = 0
    let il = list.length
    while (i < il) {
      let value = list[i]
      if (value.id === id) {
        value.error = reason
        break
      }
      i++
    }
  },
  done: function (id) {
    // set correct
    let i = 0
    let il = list.length
    while (i < il) {
      let value = list[i]
      if (value.id === id) {
        value.done = true
        break
      }
      i++
    }
  },
  wait: function () {
    console.log(chalk.white.bold('Please wait...'))
  },
  print: function (finished) {
    // clear cli
    process.stdout.write('\x1B[2J')
    // reset cursor
    process.stdout.write('\x1B[0f')

    // output all stored steps
    console.log(chalk.inverse('--------------------- SET-UP-OSX --------------------'))
    console.log(chalk.inverse(' Follow these steps to install and prepare your Mac: '))
    let i = 0
    let il = list.length
    let errors = 0
    let lastCategory = ''
    while (i < il) {
      let item = list[i]
      if (item.category !== lastCategory) {
        lastCategory = item.category
        console.log(chalk.bgWhite.black(spaces('- ' + item.category + ' ', 53)))
      }
      if (item.done) {
        console.log(chalk.green('\u2713 ' + item.note))
      } else if (item.error) {
        errors++
        console.log(chalk.red('\u2715 ' + item.note + '\n  > Reason: ' + item.error))
      } else {
        // current task
        console.log(chalk.white('\u2022 ' + item.note))
        if (item.url) {
          // show url to download when not yet downloaded
          console.log(chalk.white('  \u279D ') + chalk.white.bold('Download here: ' + item.url))
        }
        if (item.subtasks) {
          subList(item.subtasks, true)
        }
        if (item.comments) {
          subList(item.comments)
        }
      }
      i++
    }

    if (finished) {
      if (errors === 0) {
        console.log(chalk.inverse('-------------------- ALL FINISHED -------------------'))
      } else if (errors === 1) {
        console.log(chalk.inverse('------------- FINISHED BUT WITH ' + errors + ' ERROR -------------'))
      } else {
        console.log(chalk.inverse('------------- FINISHED BUT WITH ' + errors + ' ERRORS ------------'))
      }
      console.log(chalk.inverse('--------------------- ENJOY OSX! --------------------'))
    }
  }
}
