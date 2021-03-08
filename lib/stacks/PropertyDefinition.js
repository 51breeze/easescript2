const Stack = require("../Stack");
const Utils = require("../Utils");
class PropertyDefinition extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isPropertyDefinition= true;
        this._metatypes = [];
        this._annotations = [];
        this.kind = node.kind;
        console.log( node.comments )
        this.modifier = Utils.createStack( compilation, node.modifier, scope, node,this );
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
        this.isProperty=true;
        compilation.module.addMember(this.declarations[0].id.value(), this);
    }
    set metatypes(value){
        this._metatypes = value;
    }
    get metatypes(){
       return this._metatypes;
    }
    set annotations(value){
        this._annotations = value;
    }
    get annotations(){
        return this._annotations;
    }
    get init(){
        return this.declarations[0].init;
    }
    get id(){
        return this.declarations[0].value();
    }
    get acceptType(){
        return this.declarations[0].acceptType;
    }
    get assignItems(){
        return this.declarations[0].assignItems;
    }
    reference(){
        return this.declarations[0].reference();
    }
    referenceItems(){
        return this.declarations[0].referenceItems();
    }
    description(){
        return this.declarations[0].description();
    }
    type(){
        return this.declarations[0].type();
    }
    parser(syntax){
        this.declarations[0].parser(syntax)
    }
    throwError(message){
        this.declarations[0].throwError(message)
    }
    throwWarn(message){
        this.declarations[0].throwWarn(message)
    }
    value(){
        return this.declarations[0].value();
    }
    raw(){
        return this.declarations[0].raw();
    }
}

module.exports = PropertyDefinition;