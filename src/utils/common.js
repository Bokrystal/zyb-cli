// 根据我们想要实现的功能配置执行动作，遍历产生对应的命令
const mapActions = {
  create: {
    alias: "c", //别名
    description: "创建一个项目", // 描述
    examples: [
      //用法
      "zyb-cli create <project-name>",
    ],
  },
  config: {
    //配置文件
    alias: "cfg", //别名
    description: "config project variable", // 描述
    examples: [
      //用法
      "zyb-cli config set <k> <v>",
      "zyb-cli config get <k>",
    ],
  },
  "*": {
    alias: "", //别名
    description: "command not found", // 描述
    examples: [], //用法
  },
};
// git仓库的账号名
const userName = 'Bokrystal'


const axios = require("axios");

// 获取仓库列表
const fetchReopLists = async () => {
  const repoType = 'users'
  // const repoType = 'orgs'

  // 获取当前组织或者用户中的所有仓库信息,这个仓库中存放的都是项目模板
  const { data } = await axios.get(`https://api.github.com/${repoType}/${userName}/repos`);
  return data;
};

// 封装loading效果
const ora = require("ora"); // ora 注意安装版本，太新的版本不支持 Common.js 模块规范 require
const fnLoadingByOra =
  (fn, message) =>
  async (...args) => {
    const spinner = ora(message);
    spinner.start();
    let result = await fn(...args);
    spinner.succeed(); // 结束loading
    return result;
  };

// 获取仓库(repo)的版本号信息
const getTagLists = async (repo) => {
  const { data } = await axios.get(
    `https://api.github.com/repos/${userName}/${repo}/tags`
  );
  return data;
};

const { downloadDirectory } = require("./constants");

const { promisify } = require("util");
const downloadGitRepo = require("download-git-repo");
/* 将downloadGit改为promise，因为download-git-repo不是promise，
 而我们在项目中都用async await需要我们自己包装为promise。*/
const downloadGit = promisify(downloadGitRepo); // 将项目下载到当前用户的临时文件夹下
const downDir = async (repo, tag) => {
  let project = `${userName}/${repo}`; //下载的项目
  if (tag) {
    project += `#${tag}`;
  }

  // 创建本地临时项目地址 c:/users/lee/.myTemplate
  let dest = `${downloadDirectory}/${repo}`;
  //把项目下载当对应的目录中
  // console.log(dest, "项目从git上下载后存在的临时目录");
  // console.log(project, "该版本的项目的git地址");
  try {
    await downloadGit(project, dest);
  } catch (error) {
    console.log(error);
  }
  return dest;
};

// 从本地临时文件 复制项目 到本地工作文件
const ncp = require("ncp");
// const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const metalsmith = require("metalsmith");
// consolidate是一个模板引擎的结合体。包括了常用的jade和ejs。
let { render } = require("consolidate").ejs;
render = promisify(render); // 包装渲染方法

const copyTempToLocal = async (target, projectName) => {
  // target 临时文件夹路径
  // path.resolve() 将返回当前工作目录的绝对路径
  const resolvePath = path.join(path.resolve(), projectName);
  // 此处模拟如果仓库中有ask.js就表示是复杂的仓库项目
  if (!fse.existsSync(path.join(target, "ask.js"))) {
    await ncp(target, resolvePath);
    fse.remove(target);
  } else {
    //复杂项目
    // 1) 让用户填信息
    await new Promise((resolve, reject) => {
      // metalsmith ：读取所有文件，实现模板渲染
      metalsmith(__dirname)
        .source(target) // 遍历下载的目录
        .destination(resolvePath) // 最终编译好的文件存放位置
        // 读取ask.js设置初始化项目
        .use(async (files, metal, done) => {
          let args = require(path.join(target, "ask.js"));
          let res = await inquirer.prompt(args);
          let met = metal.metadata();
          // 将询问的结果放到metadata中保证在下一个中间件中可以获取到
          Object.assign(met, res);
          //  ask.js 只是用于 判断是否是复杂项目 且 内容可以定制复制到本地不需要
          delete files["ask.js"];
          done();
        })
        .use((files, metal, done) => {
          const res = metal.metadata();
          //  获取文件中的内容
          Reflect.ownKeys(files).forEach(async (file) => {
            //  文件是.js或者.json才是模板引擎
            if (file.includes(".js") || file.includes(".json")) {
              let content = files[file].contents.toString(); //文件内容
              //  我们将ejs模板引擎的内容找到 才编译
              if (content.includes("<%")) {
                content = await render(content, res);
                // Buffer对象是Node处理二进制数据的一个接口。它是Node原生提供的全局对象,可以直接使用,不需要require(‘buffer’
                // Buffer.from()方法用于创建包含指定字符串，数组或缓冲区的新缓冲区。
                files[file].contents = Buffer.from(content); //渲染
              }
            }
          });
          done();
        })
        .build((err) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        });
    });
  }
};

module.exports = {
  mapActions,
  fnLoadingByOra,
  fetchReopLists,
  getTagLists,
  downDir,
  copyTempToLocal,
};
