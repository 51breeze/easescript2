const Stack = require("../Stack");
class BreakStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        node.name = "break";
    }

    check(){
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
        this.throwError("Break keyword must be contain in the switch,while,do,for");
    }

   parser(syntax){
       this.check();
   }
   
   emit( syntax ){
       this.check();
       return syntax.makeBreakStatement(this.scope);
   }
}

module.exports = BreakStatement;