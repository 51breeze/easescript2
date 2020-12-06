const Stack = require("../Stack");
const Utils = require("../Utils");
class BreakStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
    }

   parser(syntax){
        let parent = this.parentStack;
        while( parent ){
            const type = parent.node.type;
            if( type==="SwitchCase" || type==="while" || type==="do" || type==="for"){
               return;
            }else if(type==="FunctionExpression"){
               break; 
            }else{
                parent = parent.parentStack;
            }
        }
        this.compilation.throwErrorLine("At {code} break keyword must be contain in the switch,while,do,for", this.node )
   }
   
   emit( syntax )
   {
       return syntax.makeBreakStatement(this.scope);
   }
}

module.exports = BreakStatement;