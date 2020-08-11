const Parser = require("./Parser");
const Module  = require("./Module");
const Compilation  = require("./Compilation");
const fs     = require("fs");
const path   = require("path");
const cwd    = process.cwd();

class Compiler {

    constructor( options )
    {
       this.options = options;
       this.modules = new Map();
       this.compilations = [];
    }

    getGrammar( syntax )
    {
       switch( (syntax||"").toLowerCase() ){
            case "php" :
               return require("./syntax/PHP");
            case "golang" :
               return require("./syntax/GoLang");
            case "java" :
               return require("./syntax/Java");
            case "python" :
                return require("./syntax/Python");
       }
       return require("./syntax/JavaScript");
    }

    getModuleById( id ){

        for (let module of this.modules.values()) 
        {
            if( module.id === id )
            {
                return module;
            }
        }
        return null;
    }

    getFileAbsolute( file )
    {
        if( typeof file === "string" )
        {
            return path.isAbsolute( file ) ? file : path.resolve(cwd, file);
        }else{
            throw new Error(`${file} is not exists.`);
        }
    }

    createModule( file )
    {
        file = this.getFileAbsolute( file )
        let module = this.modules.get( file );
        if( !module )
        {
            module = new Module(this);
            module.file = file;
            module.source = fs.readFileSync(file).toString();
            module.ast = Parser.Parser.parse(module.source,{});
            this.modules.set( file,  module );
        }
        return module;
    }

    createCompilation( module )
    {
        const compilation = new Compilation(this, module)
        this.compilations.push( compilation );
        return compilation;
    }

    start()
    {
        const file = this.options.file;
        const module = this.createModule( file );
        const compilation = this.createCompilation( module );
        compilation.build(["javascript"]);
    }
}

Compiler.start=( options )=>{
    const compilation =  new Compiler( options );
    compilation.start();
}

module.exports = Compiler;
