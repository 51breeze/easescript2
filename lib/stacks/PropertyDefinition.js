const Stack = require("../Stack");
const Utils = require("../Utils");
class PropertyDefinition extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isPropertyDefinition= true;
        this._metatypes = [];
        this._annotations = [];
        this.kind = node.kind;
        this.modifier = Utils.createStack( compilation, node.modifier, scope, node,this );
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
        this.isProperty=true;
        compilation.module.addMember(this.declarations[0].id.value(), this);
    }
    definition(){
        const identifier = this.value();
        const context    = this;
        const modifier = this.modifier ? this.modifier.value() : "public";
        const _static = this.static ? 'static ' : '';
        const def = this.declarations[0].definition();
        return {
            kind:"property",
            comments:context.comments,
            identifier:identifier,
            expre:`(property) ${_static}${modifier} ${def.expre}`,
            location:this.declarations[0].getLocation(),
            file:this.compilation.module.file,
            context
        };
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
    check(grammar){
        this.declarations[0].check(grammar);
        const metatypes = this.metatypes;
        const annotations = this.annotations;
        metatypes && metatypes.forEach( item=>item.check(grammar) );
        annotations && annotations.forEach( item=>item.check(grammar) );
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
    parser(grammar){
        this.declarations[0].parser(grammar)
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