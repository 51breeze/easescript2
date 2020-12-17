const Module  = require("./Module");
const Compilation  = require("./Compilation");
const path   = require("path");
const cwd    = process.cwd();
const events = require('events');
const Globals = require('./Globals');
const dirname = __dirname;

class Compiler extends events.EventEmitter{

    constructor( options )
    {
       super(); 
       this.options = options;
       this.modules = new Map();
       this.compilations = new Map();
       this.suffix = options.suffix || ".es";
       this.main = [];
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
            const global = Globals.type( file );
            if( global )
            {
               return path.join(dirname,"types", global+this.suffix );
            }

            if( file.lastIndexOf( this.suffix ) < 1 )
            {
                file =file+this.suffix;
            }
            return path.isAbsolute( file ) ? file : path.resolve(cwd, file );

        }else 
        {
            throw new Error(`${file} is not exists.`);
        }
    }

    createModule( file )
    {
        file = this.getFileAbsolute( file )
        let module = this.modules.get( file );
        if( !module )
        {
            const event = {file,module};
            this.emit("createModule", event);
            module = event.module || new Module(this);
            module.file = file;
            this.modules.set(file, module);
        }
        return module;
    }

    createCompilation( module )
    {
        if( this.compilations.has( module ) )
        {
            return this.compilations.get( module );
        }

        const event = {module,compilation:null};
        this.emit("createCompilation", event);
        const compilation = event.compilation || new Compilation(this, module);
        this.compilations.set( module, compilation);
        return compilation;
    }

    start( syntaxs )
    {
        const file = this.options.file;
        const module = this.createModule( file );
        const compilation = this.createCompilation( module );
        this.main.push( module.file );
        compilation.build( syntaxs );
    }
}

Compiler.start=( options )=>{
    const compiler =  new Compiler( options );
    compiler.start( ["javascript"] );
}

module.exports = Compiler;
