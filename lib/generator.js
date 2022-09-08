const ora = require('ora')
const inquirer = require('inquirer')
const chalk = require('chalk')
const util = require('util')
const path = require('path')
const downloadGitRepo = require('download-git-repo')
const { getRepoList, getTagList } = require('./http')

// 添加载入动画
async function wrapLoading(fn, message, ...args) {
  // 使用org初始化 传入提示信息 message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()

  try {
    // 执行方法 fn
    const result = await fn(...args)
    // 成功状态
    spinner.succeed()
    return result
  } catch (error) {
    // 失败状态
    spinner.fail('Request failed, refetch ...')
  }
}

// 处理项目创建逻辑
class Generator  {
  constructor (name, targetDir) {
    // 目录名称
    this.name = name
    // 创建位置
    this.targetDir = targetDir
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }

  // 获取用户选择的模板
  // 1. 从远程拉取模板数据
  // 2. 用户选择下载模板名称
  // 3. return 用户选择名称
  async getRepo() {
    // 1. 从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template')
    if(!repoList) return

    // 过滤我们需要的模板名称
    const repos = repoList.map(item => item.name)
    
    // 用户选择下载模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'Please choose a template to create project'
    })

    // 3. return 用户选择名称
    return repo
  }

  // 获取用户版本
  // 1. 基于repo结果，拉取对应 tag 列表
  // 2. 用户选择自己下载的 tag
  // 3. return 用户选择 tag
  async getTag(repo) {
    // 1. 基于repo结果，拉取对应 tag 列表
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo)
    if (!tags) return

    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name)

    // 2. 用户选择自己下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: 'Place choose a tag to create project'
    })

    // 3. return 用户选择 tag
    return tag
  }

  // 下载远程模板
  // 1. 拼接下载地址
  // 2. 调用下载方法
  async download(repo, tag) {
    // 1. 拼接下载地址
    const requestUrl = `zs-cli/${repo}${tag ? '#' + tag : ''}`
    // 2. 调用下载方法
    await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载信息
      requestUrl, // 下载地址
      path.resolve(process.cwd(), this.targetDir)   // 创建位置
    )
  }

  // 核心逻辑
  // 1. 获取模板名称
  // 2. 获取tag名称
  // 3. 下载模板到模板目录
  // 4. 模板使用提示
  async create() {
    // 1. 获取模板名称
    const repo = await this.getRepo()

    // 2. 获取tag名称
    const tag = await this.getTag(repo)
    console.log(`用户选择了，repo=${repo}，tag=${tag}`)

    // 3. 下载模板到模板目录
    const a = await this.download(repo, tag)
    console.log('aaaa', a)

    // 4. 模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
    console.log('  npm run dev\r\n')
  }
}

module.exports = Generator
