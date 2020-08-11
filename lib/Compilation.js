const TopScope = require("./scope/TopScope.js");
class Compilation {

    constructor( compiler, module )
    {
       this.compiler = compiler;
       this.module   = module;
       this.grammar = new Map();
    }

    getDescribe( key, isStatic )
    {
        if( isStatic )
        {
            return this.module.getMethod( key );
        }
        return this.module.getMember( key );
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


    build( complilactionSyntaxs )
    { 
        complilactionSyntaxs.forEach((syntax)=>{
            const grammar = this.createGrammar( syntax );
            const scope = new TopScope();
            grammar.scope = scope;
            grammar.parser( this.module.ast, scope);
        });
    }
}


module.exports = Compilation;
