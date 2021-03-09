const Utils = require("../Utils");
const Expression = require("./Expression");
class TypeAssertExpression extends Expression{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isTypeAssertExpression= true;
          this.left = Utils.createStack( compilation, node.left, scope, node,this );
          this.right = Utils.createStack( compilation, node.right, scope, node,this );
     }
     description(){
          return this;
     }
     reference(){
          return this.left.reference();
     }
     referenceItems(){
          return this.left.referenceItems();
     }
     type(){
          return this.right.type();
     }
     parser(grammar){
          this.left.parser(grammar);
          this.right.parser(grammar);
     }
}

module.exports = TypeAssertExpression;