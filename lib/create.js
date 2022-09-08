const path = require('path')

// const chalk = require('chalk')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const Generator = require('./generator')


module.exports = async function(name, options) {
  // console.log('>>> create.js', chalk.green(name), options)
  // 执行创建命令

  // 当前命令行选择的目录
  const cwd = process.cwd()
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name)

  // 目录存在
  if (fs.existsSync(targetAir)) {
    // 是否强制创建
    if (options.force) {
      await fs.remove(targetAir)
    } else {
      // 询问是否强制覆盖
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            {
              name: 'Overwrite',
              value: 'overwrite'
            }, {
              name: 'Cancel',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        return
      } else if (action === 'overwrite'){
        // 移除已存在目录
        await fs.remove(targetAir)
      }
    }
  }

  // 创建项目
  const generator = new Generator(name, targetAir)
  // 开始创建
  generator.create()
}
