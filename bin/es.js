#!/usr/bin/env node  

const program = require('commander');
program
.version( 'EaseScript '+require('../package.json').version )
.option('-f, --file [file]', '指定需要编译的文件')
.option('-c, --config [file]', '指定配置文件',null)
.option('-o, --output [dir]', '输出路径','./build')
.option('-s, --syntax [javascript|php]', '要构建的语法','javascript')
.option('-S, --suffix [value]', '源文件的后缀名','.es')
.option('-r, --reserved [keyword1,keyword2,...]', '指定需要保护的关键字', function (val) {
    return val.split(',');
})
.option('--env, --environment [dev|test|production]', '构建模式是用于生产环境还是测试环境','production')
program.parse(process.argv);
const Compiler = require('../index.js');
const config = [
   "file","config","output","syntax","suffix","reserved","environment"
];
const options = {};
config.forEach( name=>{
    options[name] = program[name] || null;
});
Compiler.start(options);
