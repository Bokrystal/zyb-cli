#!/usr/bin/env node

// 上面 #! 用于指明这个脚本文件的解释程序 表示此文件是一个可执行文件，并且指定了用 node执行
// /usr/bin/env就是告诉系统可以在PATH目录中查找。
/* 所以配置#!/usr/bin/env node, 就是解决了不同的用户node路径不同的问题，
可以让系统动态的去查找node来执行你的脚本文件。*/

require("../src/main.js");
