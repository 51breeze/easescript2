const Stack = require("../Stack");
const Utils = require("../Utils");
const Expression = require("./Expression");
class TypeAssertExpression extends Expression{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.left = Utils.createStack( compilation, node.left, scope, node,this );
          this.right = Utils.createStack( compilation, node.right, scope, node,this );
     }

     description(){
          return this.left.description();
     }

     type(){
          return this.right.type();
     }

     parser(syntax){
          this.left.parser(syntax);
          this.right.parser(syntax);
     }

     emit(syntax){
          return this.left.emit( syntax );
     }
}

module.exports = TypeAssertExpression;