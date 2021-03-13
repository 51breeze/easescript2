const Compiler = require("./lib/Compiler");
const options = {service:true,locations:true};
class Service{
    set options( value ){
        this._options = Object.assign({service:true,locations:true},options,value);
    }
    get options(){
        return this._options || options;
    }
    get compiler(){
        return this._compiler || (this._compiler = new Compiler(options));
    }
    getModule(file){
        file = this.compiler.getFileAbsolute(file);
        const module = this.compiler.modules.get( file );
        if( !module ){
            const compilation = this.compiler.createCompilation( this.compiler.createModule( file ) );
            compilation.parser();
            return compilation.module;
        }
        return module;
    }
    comments(result){
        if( result && result.comments ){
            result.comments.forEach( item=>{
                if( item.type=="Block" ){
                    item.value = item.value.split(/\r\n/g).map( val=>val.replace(/^(\s+|\t+)?\*?/g,"") ).filter( val=>!!val).join("\r\n");
                }else{
                    console.log( item )
                    //item.value = item.value.split(/^(\s+|\t+)?([\/]+)/g);
                }
            });
        }
        return result;
    }

    position(result){

    }

    start(action, file, startAt, line, character, word){
        try{
            const module = this.getModule(file);
            const stack = action==="completion" ? module.getStackByAt(startAt, startAt, -1) : module.getStackByAt(startAt);
            if( stack ){
                console.log(action,  "====node type===", stack.node.type, startAt, stack.parentStack.node.type )
                const result = stack.definition();
                if( result && action==="definition" && !result.location  ){
                    return null;
                }
                if( result && action==="hover" ){
                    this.comments(result);
                }
                return result;
            }else{
                console.log(action,  "====not found===", startAt)
            }
            return null;
        }catch(e){
            console.log(e);
        }
    }
}

module.exports = Service;