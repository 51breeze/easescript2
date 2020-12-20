const MethodDefinition = require("./MethodDefinition");
const UnionType = require("../UnionType");
const returnTypeKey = Symbol("returnType");
class MethodGetterDefinition extends MethodDefinition{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.callable = false
        this[returnTypeKey] = null;
        this.isAccessor = true;
    }

    parser(syntax){
        super.parser(syntax);
        if( this.expression.params.length != 0 ){
            this.throwError(`"${this.key.value()}" getter does not set param`);
        }
        if( this.scope.returnItems.length < 1 ){
           this.throwError(`"${this.key.value()}" getter accessor must have a return expression`);
        }
    }

    type(){
        if( this.expression.returnType ){
            return this.expression.returnType.type();
        }
        if( this.scope.returnItems.length < 1 ){
            this.throwError(`"${this.key.value()}" getter accessor must have a return expression`);
        }
        if( this[returnTypeKey] ){
            return this[returnTypeKey];
        }
        const self = this.scope.returnItems.filter( item=>{
            return item.scope === this.scope;
        });
        const children = this.scope.returnItems.filter( item=>{
            return item.scope !== this.scope;
        });
        const items = self.slice(0,1).concat( children );
        return this[returnTypeKey]=new UnionType( items.map( item=>item.type() ).filter( item=>!!item ) );
    }
}

module.exports = MethodGetterDefinition;