const program = require("commander");
const { version } = require("./utils/constants");
const { mapActions } = require("./utils/common");
const path = require("path")
// 根据我们想要实现的功能配置执行动作，遍历产生对应的命令
// 静态方法 Reflect.ownKeys()返回一个由目标对象自身的属性键组成的数组。Reflect.ownKeys(）可以返回包含Symbol属性在内的自有属性。
Reflect.ownKeys(mapActions).forEach((action) => {
  program
    .command(action) //配置命令的名字
    .alias(mapActions[action].alias) // 命令的别名
    .description(mapActions[action].description) // 命令对应的描述
    .action((name, cmd) => {
        // console.log(name,cmd)
      //动作
      if (action === "*") {
        //访问不到对应的命令 就打印找不到命令
        console.log(mapActions[action].description);
      } else {
        console.log(action);
        // 分解命令 到文件里 有多少文件 就有多少配置 create config
        // zyb-cli create project-name ->[node,zyb-cli,create,project-name]
        console.log(process.argv);
        // 拼接当前绝对路径+命令 -> /zyb-cli/src/create.js
        // 即执行 create.js
        require(path.join(__dirname,action))(...process.argv.slice(3))
      }
    });
});

// 自定义事件监听
// 监听用户的help事件
program.on('--help',()=>{
  console.log('\nExamples:');
  Reflect.ownKeys(mapActions).forEach((action)=>{
      mapActions[action].examples.forEach((example) => {
          console.log(`${example}`);
      })
  })
})
/*
process.argv 属性返回一个数组，这个数组包含了启动Node.js进程时的命令行参数， 其中：
1 数组的第一个元素process.argv[0]——返回启动Node.js进程的可执行文件所在的绝对路径 
2 第二个元素process.argv[1]——为当前执行的JavaScript文件路径 
3 剩余的元素为用户输入的的每个命令行参数*/
// console.log(process.argv);
// .version()方法可以设置cli的版本，-V和--version设置输入什么样的命令值后命令行可以输出当前的版本号。
program.version(version,'-v','--version').parse(process.argv);
// 如果只是执行了 zyb-cli 命令 相当于执行 zyb-cli --help
if(!program.args.length){
  program.help();
}