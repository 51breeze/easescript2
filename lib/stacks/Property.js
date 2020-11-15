const Stack = require("../Stack");
const Utils = require("../Utils");
class Property extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.kind = node.kind;
        this.key = Utils.createStack( compilation, node.key,scope, node,this );
        this.init = Utils.createStack( compilation, node.value,scope, node,this );
   }

   get description()
   {
      return this.value.description;
   }

   parser()
   {
   }

   value()
   {
       return `"${this.key.value()}":${this.init.emit()}`;
   }

   emit()
   {
       return this.value();
   }
}

module.exports = Property;