#! /usr/bin/env node

const program = require('commander')
const figlet = require('figlet')

const version = require('../package.json').version
const create = require('../lib/create.js')

program
  .version(`v${version}`)
  .command('create <name>')
  .description('create a new project')
  // -f or --force 为强制创建，如果有目录则直接覆盖
  .option('-f, --force', 'overwrite target directory if it exist')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>')
  .option('-d, --delete <path>', 'delete option from config')
  .action((name, options) => { 
    create(name, options)
    // console.log(name, options)
  })

// 配置UI
program
  .command('ui')
  .description('start add open roc-cli ui')
  .option('-p, --port <port>', 'Port used for the UI Server')
  .action((option) => {
    console.log(option)
  })
// 监听--help
program
  .on('--help', () => {
    console.log('figlet')
    console.log('\r\n' + figlet.textSync('996sdk-cli', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 120,
      whitespaceBreak: true
    }));
  })

program.parse(process.argv)
