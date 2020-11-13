const Stack = require("../Stack");
const Utils = require("../Utils");
class MemberExpression extends Stack{

   constructor(module,node,scope,parent)
   {
        super(module,node,scope,parent);
        this.object = Utils.createStack( module, node.object, scope, node );
        this.property = Utils.createStack( module, node.property, scope, node );
   }

   parser(){

    
   }

   raw(){
       return [this.object.raw(), this.property.raw()].join(".");
   }

   emit(){
      return this.raw();
   }
}

module.exports = MemberExpression;