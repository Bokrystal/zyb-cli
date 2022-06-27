// create的功能是 创建项目

// inquirer 注意安装版本，太新的版本不支持 Common.js 模块规范 require
const inquirer = require("inquirer");
const chalk = require("chalk");
const {
  fnLoadingByOra,
  fetchRepoLists,
  getTagLists,
  downDir,
  copyTempToLocal,
} = require("./utils/common");


module.exports = async (projectName) => {
  // 初始化模板仓库的地址
  const { defaultRepo } = await inquirer.prompt([{
    type: 'confirm',
    name: 'defaultRepo',
    message: '你是否下载默认地址项目?\n ',
    default: true
  }]);
  if (!defaultRepo) {
    console.log(`您还可以通过config命令zyb-cli config set <k> <v>来设置选择你要gitHub地址上下载项目，具体案例如下：\n`);
    console.log(`执行${chalk.green('zyb-cli config set <repo-type> <github-name>')}`);
    return
  }
  // let repos = await fetchRepoLists()
  let repos = await fnLoadingByOra(fetchRepoLists, "正在链接模板的仓库...")();
  repos = repos.map((item) => item.name);
  console.log(repos, projectName);
  // 使用inquirer 在命令行中可以交互

  //   inquirer.prompt([
  //     {
  //       type: 'confirm',
  //       name: 'result',
  //       message: '你确定使用这个吗?',
  //       default: true
  //     }
  //   ]).then((answers) => {
  //     console.log('结果为: ',answers)
  //   })

  const { repo } = await inquirer.prompt([
    {
      type: "list",
      name: "repo",
      message: "请选择一个你要创建的项目",
      choices: repos,
    },
  ]);
  //   console.log(`我现在选择了那个仓库？ ${repo}`);

  // 函数柯里化传入仓库
  let tags = await fnLoadingByOra(
    getTagLists,
    `正在链接你的选择的仓库${repo}的版本号...`
  )(repo);
  tags = tags.map((item) => item.name);
  //   console.log(`仓库 ${repo}的版本信息列表：${tags}`);

  // 增加选择版本信息
  const { tag } = await inquirer.prompt([
    {
      type: "list",
      name: "tag",
      message: "请选择一个该项目的版本下载",
      choices: tags,
    },
  ]);
  console.log(`选中的仓库 ${repo} 的版本为：${tag}`);
  // 下载项目到临时文件夹 C:\Users\lee\.myTemplate
  const { dest, result } = await fnLoadingByOra(downDir, "下载项目中...")(
    repo,
    tag
  );
  console.log(dest, result);
  if (result) await copyTempToLocal(dest, projectName);
  else console.log("下载失败，请重试！");
};
