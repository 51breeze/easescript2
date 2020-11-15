const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionScope = require("../scope/FunctionScope");
class FunctionExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        if( !scope.type("method") )
        {
            scope = new FunctionScope(scope);
            if( node.type==="FunctionDeclaration" )
            {
                scope.define("this", compilation.getType("Object") );
            }
        }

        super(compilation,node,scope,parentNode,parentStack);
        this.returnType= Utils.createStack(compilation,node.returnType,scope,node,this);
        this.body      = Utils.createStack(compilation,node.body,scope,node,this);
        this.params    = node.params.map( item=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
   }

   parser()
   {
        this.body.parser();
   }

   emit()
   {
       const body = this.body.emit();
       return `function(){${body}}`;
   }

}

module.exports = FunctionExpression;