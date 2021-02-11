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

const syntaxMap = {};
const target = {
    name:"javascript",
    modules,
    builder(stack,name){
        let Syntax = syntaxMap[name];
        if( !Syntax ){
            const event = {
                name:this.name,
                syntax:modules[ name ]
            };
            stack.compilation.compiler.dispatcher("fetchSyntaxEmit",event);
            Syntax = syntaxMap[name] = event.syntax;
            if( !Syntax ){
                console.log( name )
            }
            Syntax.target=function target(){
                return target;
            }
        }
        if( Syntax ){
            const syntax = new Syntax( stack );
            return syntax.emit( this );
        }
        return null;
    }
};

Object.defineProperty(modules.Syntax,"target",{
    configurable: false,
    enumerable: false,
    value: target,
    writable: false
});

module.exports = target;