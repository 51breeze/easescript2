const fs     = require("fs");
const path     = require("path");
const Syntax = require("./Syntax");
const Namespace = require("../../Namespace.js");
class BuildEmiter extends Syntax{
    getNamespace(){
        const parse = (items)=>{
            const properties = [];
            items.forEach( item=>{
                for(var key in item){
                    properties.push(`"${key}":`+parse(item[key]) );
                }
            });
            return `{C:{${properties.join(",")}},M:{}}`;
        }
        return parse( Namespace.getStructure() )
    }
    
    emit(syntax){
        const content = [];
        const compilation = this.compilation;
        const compiler = compilation.compiler;
        const options = compiler.options;
        const output = compiler.pathAbsolute( options.output );
        const builder = ( compilation )=>{
            compilation.children.forEach( item=>builder(item) );
            if( compilation.module.isClass || compilation.module.isInterface ){
                content.push( compilation.stack.emit( syntax ) );
            }
        };
        builder( compilation );
        const Polyfill = syntax.modules.Polyfill;
        const before = [Polyfill.global];
        if( syntax.hasAsync ){
            before.push( Polyfill.generator );
            before.push( Polyfill.awaiter );
        }
        if(compiler.hasDelayClass){
           before.push(`const delayClass=[];`)
           content.push(`(function(queues,load){while(load=queues.pop())load();})(delayClass);`);
        }
        content.unshift(before.join("\r\n")+";");
        if( !fs.existsSync(output) ){
            fs.mkdirSync( output );
        }
        const file = path.resolve(output,"main.js");
        fs.writeFileSync( file, content.join("\r\n") );
        return content.join("\r\n");
    }
}

module.exports = BuildEmiter;