const fs     = require("fs");
const events = require('events');
const TopScope = require("./scope/TopScope.js");
const Parser = require("./Parser.js");
const Namespace = require("./Namespace.js");
const Module = require("./Module.js");
const Globals = require("./Globals");
const Utils  = require("./Utils.js");

class Compilation extends events.EventEmitter 
{
    constructor( compiler, module )
    {
       super(); 
       module.compilation = this;
       this.compiler = compiler;
       this.module   = module;
       this.grammar  = new Map();
       this.children = [];
       this.syntaxs  = [];
       this.annotations = [];
       this.metatypes   = [];
       this.scope=new TopScope( null );
       this.stack=null;
    }

    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }

    error(message, node, expre="")
    {
        if( node )
        {
            message+= ` (${this.module.file}:`+ this.getLinePosBy( node.end, expre || node.name || node.raw )+")";
        }
        Utils.error(message);
    }

    warn(message, node, expre=""){
        if( node ){
            message+= ` (${this.module.file}:`+ this.getLinePosBy( node.end, expre || node.name || node.raw )+")";
        }
        Utils.warn(message);
    }

    getDescribe( key, isStatic ){
        const module = this.module;
        if( isStatic )
        {
            return module.getMethod( key );
        }
        return module.getMember( key );
    }

    getReference(key,target,isStatic,kind=null){
        if( target && target instanceof Module ){
            if( isStatic ){
                return target.getMethod( key, kind );
            }
            return target.getMember( key, kind );
        }
        return target ? Namespace.fetch( key, target ) : this.getType( key );
    }

    getTypeWhenExist( id ){
        if( id ){
           id = Globals.alias( id );
           return this.module.namespace.get( id ) || Namespace.fetch( id );
        }
        return null;
    }

    getType(id){
        id = Globals.alias( id );
        const type = this.module.namespace.get( id ) || this.module.getImport(id) || Namespace.fetch( id );
        if( !type ){
            const file = this.compiler.getFileAbsolute( id.replace(/\./g,'/') );
            if( !fs.existsSync( file ) ){
               return false;
            }
            const module = this.compiler.createModule( file );
            if( !module.ast )
            {
                const compilation = new Compilation( this.compiler, module );
                this.children.push( compilation );
                compilation.build( this.syntaxs );
            }
            return module;
        }
        return type;
    }

    getLinePosBy(pos, raw){
        const lines=this.module.source.substr(0,pos+1).split(/\r\n/);
        let column = raw ? lines[lines.length-1].indexOf(raw) : 0;
        return lines.length+":"+column;
    }

    getLine(pos, raw){
        const lines=this.module.source.substr(0,pos+1).split(/\r\n/);
        return lines.length;
    }

    getCodeByLine(line){
        const lines=this.module.source.split(/\r\n/);
        const value = lines[ line-1 ] || "";
        return value.replace(/[\t\s]+/,"");
    }

    throwErrorLine(message,node){
        const value = node.name || node.value
        const line = this.getLine( node.start, value);
        const code = this.getCodeByLine(line);
        this.error( message.replace("{code}",code) , node, value );
    }

    throwWarnLine(message,node){
        const value = node.name || node.value
        const line = this.getLine( node.start, value);
        const code = this.getCodeByLine(line);
        this.warn( message.replace("{code}",code) , node, value );
    }

    createGrammar( syntax )
    {
        if( !this.grammar.has(syntax) )
        {
            const grammar = this.compiler.getGrammar( syntax );
            this.grammar.set(syntax, new grammar(this) );
        }
        return this.grammar.get(syntax);
    }

    createAst()
    {
        const module = this.module;
        if( !module.ast )
        {
            try{
               module.source = fs.readFileSync(module.file).toString();
               module.ast = Parser.Parser.parse(module.source,{});
            }catch(e){
                console.log(e);
                throw new Error( `${e.message} \r\n at ${module.file}`)
            }
        }
        return module.ast;
    }


    build( syntaxs ){ 
        this.syntaxs = syntaxs;
        const ast   = this.createAst();
        const scope = this.scope;
        const stack = this.stack || ( this.stack = Utils.createStack(this,ast,scope,null) );
        syntaxs.forEach((syntax)=>{
            if( this.module.isClass ){
                const grammar = this.createGrammar( syntax );
                stack.emit( grammar );
            }
        });
    }
}


module.exports = Compilation;
