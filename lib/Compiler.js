const Module  = require("./Module");
const Compilation  = require("./Compilation");
const path   = require("path");
const cwd    = process.cwd();
const events = require('events');
const Globals = require('./Globals');
const fs = require("fs");
const dirname = __dirname;
class Compiler extends events.EventEmitter{
    constructor( options ){
       super(); 
       options =  Object.assign({
           "reserved":["global"],
           "syntaxOptions":{
                "javascript":{
                    "target":"es6",
                    "module":"amd",
                    "useDefineProperty":true,
                    "strict":true,
                }
            }
       },options || {});
       this.options = options;
       this.modules = new Map();
       this.compilations = new Map();
       this.suffix = options.suffix || ".es";
       this.main = [];
       this.regexpSuffix = new RegExp(`(\\w+)(${this.suffix.replace(".","\\.")})$`,'i');
    }

    getGrammar( syntax ){
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
       return require("./syntax/javascript/index.js");
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

    getFileAbsolute(file, context){
        if( typeof file !== "string" )return null;
        const global = Globals.type( file );
        if( global ){
            return path.join(dirname,"types", global+this.suffix);
        }
        if( !this.regexpSuffix.test( file ) ){
            file =file+this.suffix;
        }
        if(path.isAbsolute( file )){
            return path.resolve(file);
        }
        if( context ){
            const section = context.replace(/\\/g,'/').split('/');
            let root = context;
            while( root && !fs.existsSync( path.join(root,file) ) && section.pop() ){
                root = section.join("/");
            }
            if( root ){
                return path.join(root, file);
            }
        }
        if(cwd){
            file = path.resolve(cwd,file);
            if( fs.existsSync(file) ){
                return file;
            }
        } 
        return null;
    }

    pathAbsolute(file){
        return path.isAbsolute( file ) ? path.resolve(file) : path.resolve(cwd,file);
    }

    createModule( file ){
        file = this.getFileAbsolute( file )
        let module = this.modules.get( file );
        if( !module ){
            module = new Module(this);
            module.file = file;
            this.modules.set(file, module);
        }
        return module;
    }

    createCompilation( module ){
        if( this.compilations.has( module ) )
        {
            return this.compilations.get( module );
        }
        const compilation = new Compilation(this, module);
        this.compilations.set( module, compilation);
        return compilation;
    }

    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }

    start( syntaxs ){
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
