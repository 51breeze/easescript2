const Stack = require("../Stack");
const Utils = require("../Utils");
class WhileStatement extends Stack{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isWhileStatement= true;
          this.condition = Utils.createStack(compilation,node.test,scope,node,this);
          this.body = Utils.createStack(compilation,node.body,scope,node,this);
     }

     parser(syntax){
          this.check();
          this.condition.parser(syntax);
          this.body && this.body.parser(syntax);
     }

     check(){
          if( !this.condition ){
               this.throwError("Missing condition");
          }
     }

     emit(syntax){
          this.check();
          const condition = this.condition.emit(syntax);
          const body = this.body ? this.body.emit(syntax) : null;
          if( body ){
               return `while(${condition}){${body}}`;
          }
          return `while(${condition});`;
     }
}

module.exports = WhileStatement;