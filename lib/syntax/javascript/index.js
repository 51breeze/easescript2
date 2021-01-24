const fs = require("fs");
const path = require("path");
const modules = {};
const files = fs.readdirSync(__dirname);
files.forEach( (file)=>{
    const info = path.parse(file)
    if( info.name != "index"){
       modules[ info.name ] = require(  path.join(__dirname,file) );
    }
});
module.exports = modules;