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
    start(action, file, startAt, token){
        const module = this.getModule(file);
        const stack = module.getStackByAt(startAt);
        if( stack ){
            return stack.definition();
        }
        return null;
    }
}

module.exports = Service;