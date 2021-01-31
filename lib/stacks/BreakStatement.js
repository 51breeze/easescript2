const Stack = require("../Stack");
class BreakStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isBreakStatement= true;
        node.name = "break";
        let parent = parentStack;
        while(parent && !parent.isFunctionExpression){
            if( parent.isSwitchCase || parent.isSwitchStatement || parent.isWhileStatement || parent.isDoWhileStatement ){
                parent.hasBreak = true;
            }
            parent = parent.parentStack;
        }
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
}

module.exports = BreakStatement;