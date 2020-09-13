const TopScope = require("./scope/TopScope.js");
const Parser = require("./Parser");
const fs     = require("fs");
const Namespace = require("./Namespace");
const Module = require("./Module");
const Type = require("./Type.js");
const events = require('events');
const Grammar = require('./Grammar.js');

class Compilation extends events.EventEmitter 
{
    constructor( compiler, module )
    {
       super(); 
       this.compiler = compiler;
       this.module   = module;
       this.grammar  = new Map();
       this.children = [];
       this.syntaxs  = [];
    }

    getDescribe( key, isStatic )
    {
        const module = this.module;
        if( isStatic )
        {
            return module.getMethod( key );
        }
        return module.getMember( key );
    }

    getReference(key,target,isStatic)
    {
        if( target )
        {
            if( target instanceof Type )
            {
                if( target.target )
                {
                    target = target.target;
                }else {
                    target = this.getType( target.name );
                }
            }

            if( target instanceof Module )
            {
                if( isStatic )
                {
                    return target.getMethod( key );
                }
                return target.getMember( key );
            }
        }
        return target ? Namespace.fetch( key, target ) : this.getType( key );
    }

    getType(id)
    {
        const type = this.module.namespace.get( id ) || this.module.getDepend(id) || Namespace.fetch( id );
        if( !type )
        {
            const module = this.compiler.createModule( this.compiler.getFileAbsolute( id ) );
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

    checkType(acceptType, expreType )
    {
        if( acceptType instanceof Type )
        {
            return acceptType.of( expreType );
        }

        if(  acceptType instanceof Module )
        {
            
        }

    }

    getLinePosBy(pos, raw)
    {
        const lines=this.module.source.substr(0,pos+1).split(/\r\n/);
        let column = raw ? lines[lines.length-1].indexOf(raw) : 0;
        return lines.length+":"+column;
    }

    throwError( message, pos, raw)
    {
        if( pos )
        {
            message+=" ("+ this.getLinePosBy( pos, raw )+")";
        }
        throw new ReferenceError( message  );
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
    

    build( syntaxs )
    { 
        const ast = this.createAst();
        this.syntaxs = syntaxs;
        syntaxs.forEach((syntax)=>{
            const grammar = new Grammar( this );
            const scope = new TopScope();
            grammar.scope = scope;
            grammar.stack = grammar.parser(ast, scope);
            const builder = this.createGrammar( syntax );

            if( this.module.isClass )
            {
               builder.toString( grammar.stack );
            }

        });
        
    }
}


module.exports = Compilation;
