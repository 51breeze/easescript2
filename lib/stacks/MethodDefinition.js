const Stack = require("../Stack");
const Utils = require("../Utils");
const MethodScope = require("../scope/MethodScope");
class MethodDefinition extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        scope = new MethodScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.metatypes = [];
        this.annotations = [];
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.key     = Utils.createStack(compilation,node.key,scope,node,this);
        this.value   = Utils.createStack(compilation,node.value,scope,node,this);
        this.modifier= Utils.createStack(compilation,node.modifier,scope,node,this);
        if( !this.static )
        {
            scope.define("this", module);
        }
        compilation.module.addMember(this.key.value(), this);
    }

   parser()
   {
      this.value.parser();
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
       return this.value.emit();
   }
}

module.exports = MethodDefinition;