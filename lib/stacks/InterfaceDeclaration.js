const Stack = require("../Stack");
const Utils = require("../Utils");
class InterfaceDeclaration extends Stack{

    constructor(module,node,scope,parentNode,metatypes,annotations)
    {
        super(module,node,scope,parentNode);
        this.metatypes = metatypes;
        this.annotations = annotations;
        this.id          = Utils.createStack(module,node.id,scope,node);
        this.inherit     = Utils.createStack(module,node.extends,scope,node);
        this.implements  =(node.implements || []).map( (item)=>{
            return Utils.createStack(module,item,scope,node);
        });
        this.modifier = Utils.createStack(module,node.modifier,scope,node);
        this.body     = (node.body.body || []).map( (item)=>{
            return Utils.createStack(module,item,scope,node);
        });
   }
   
   parser()
   {
      return this.body.parser();
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = InterfaceDeclaration;