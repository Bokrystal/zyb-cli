// 负责 config\cfg
/***
 * 主要功能是：配置文件的读写操作，若无配置文件，需要提供默认的值
 * 本项目实现了 可以配置调用gitHub上哪个组织或者用户来下载模板
 *'zyb-cli config set <k> <v>',
 *'zyb-cli config get <k>'
 */

const program = require("commander");
const { configFile, defaultConfig } = require("./utils/constants");
const fs = require("fs");
const { encode, decode } = require("ini");
const chalk = require("chalk");

module.exports = (action, k, v) => {
  console.log(action, k, v, "进入config命令");

  if (!action) {
    program.help();
    return;
  }
  const haveConfigFile = fs.existsSync(configFile); //配置文件是否存在
  const obj = {};
  if (haveConfigFile) {
    const content = fs.readFileSync(configFile, "utf-8");
    const c = decode(content); //将文件内容解析成对象
    Object.assign(obj, c);
  }
  const flag = obj.v || defaultConfig[k] == k;
  if (action === "get") {
    if (flag) {
      console.log(obj.v || defaultConfig.v);
    } else {
      console.log(
        `没有此项，您可能是想输入为 ${chalk.green(
          "zyb-cli config get <k>"
        )}命令，\n比如:  ${chalk.green("zyb-cli config get <repo-type>")}`
      );
    }
  } else if (action === "set") {
    if (k || v) {
      obj.k = k;
      obj.v = v;
      fs.writeFileSync(configFile, encode(obj));
    } else {
      console.log(
        `没有此项，您可能是想输入为 ${chalk.green(
          "zyb-cli config set <k> <v>"
        )}命令，\n比如:  ${chalk.green(
          "zyb-cli config set <repo-type> <github-name>"
        )}`
      );
    }
  } else if (action === "getVal") {
    let c = {};
    if (obj && Object.keys(obj).length > 0) {
      c = Object.assign({}, obj);
    } else {
      c = Object.assign({}, defaultConfig);
    }
    console.log(c, "通过getVal触发config.js，返回默认的组织或用户的项目");
    return c;
  }
};
