const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class ClassDeclaration extends Stack{

   constructor(module,node,scope,parentNode,metatypes,annotations)
   {
        super(module,node,scope,parentNode);
        scope = new ClassScope(scope);
        this.metatypes = metatypes;
        this.annotations = annotations;
        this.id          = Utils.createStack(module,node.id,scope,node);
        this.inherit     = Utils.createStack(module,node.superClass,scope,node);
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
        this.body.forEach(item =>{
            item.parser();
        });
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

module.exports = ClassDeclaration;