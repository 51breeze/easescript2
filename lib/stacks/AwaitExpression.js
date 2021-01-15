const Utils = require("../Utils");
const Expression = require("./Expression");
class AwaitExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.argument = Utils.createStack( compilation, node.argument, scope, node, this );
          this.isAwaitExpression= true;
          if( parentStack ){
             parentStack.isAwaitExpression = true;
          }
          let parent = parentStack;
          while(parent && !parent.isFunctionExpression){
               parent.hasAwait=true;
               parent = parent.parentStack;
          }
          const stack = this.getParentStackByName("FunctionExpression");
          this.awaitLabelIndex = ++stack.awaitCount;
     }
     description(){
          return this.argument.description();
     }
     type(){
          return this.argument.type();
     }
     check(){
          this.argument.check();
     }
     parser(syntax){
          this.argument.parser(syntax);
     }
     emit(syntax){
          const hasAfterExpression = (children)=>{
               const index = children.lastIndexOf( this.parentStack );
               return index == 0 && children.length > 1 ? -1 : index > 0 && index < children.length-2 ? 0 : 1
          }
          const pos = hasAfterExpression(this.parentStack.parentStack.childrenStack)
          //if( pos===0 ){
               return `return [4,${this.argument.emit(syntax)}];\r\n case ${this.awaitLabelIndex}:\r\n`;
         // }else{
              // return `return [4,${this.argument.emit(syntax)}];\r\n`;
          //}
     }
}

module.exports = AwaitExpression;