// 存放用户的所需要的常量
const { name, version } = require("../../package.json");

// 载临时文件存放地址 因为不同的电脑平台临时存放地址不同
// const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.myTemplate`;
// console.log(downloadDirectory);
const MY_PLATFORM_ENV =
  process.env[process.platform === "darwin" ? "HOME" : "USERPROFILE"];
const downloadDirectory = `${MY_PLATFORM_ENV}\\.myTempalte`;
const configFile = `${MY_PLATFORM_ENV}\\.repoConf`;
// 配置文件不存在时，默认提供的值
const defaultConfig = {
  k: "users",
  v: "Bokrystal",
};
module.exports = {
  name,
  version,
  downloadDirectory,
  configFile,
  defaultConfig,
};
