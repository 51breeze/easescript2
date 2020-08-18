const TopScope = require("./scope/TopScope.js");
const Parser = require("./Parser");
const fs     = require("fs");
const Namespace = require("./Namespace");

class Compilation {

    constructor( compiler, module )
    {
       this.compiler = compiler;
       this.module   = module;
       this.grammar  = new Map();
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

    getType( key , base )
    {
        return Namespace.fetch( key, base );
    }

    getLinePosBy( pos, raw)
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
            module.source = fs.readFileSync(module.file).toString();
            module.ast = Parser.Parser.parse(module.source,{});
        }
        return module.ast;
    }
    

    build( complilactionSyntaxs )
    { 
        const ast = this.createAst();
        complilactionSyntaxs.forEach((syntax)=>{
            const grammar = this.createGrammar( syntax );
            const scope = new TopScope();
            grammar.scope = scope;
            grammar.parser(ast, scope);
        });
    }
}


module.exports = Compilation;
