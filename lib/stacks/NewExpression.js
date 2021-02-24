const Utils = require("../Utils");
const Expression = require("./Expression");
const Stack = require("../Stack");
class NewExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isNewExpression= true;
        this.callee = Utils.createStack( compilation, node.callee, scope, node,this );
        this.arguments = node.arguments.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
    }

    reference(){
        return this;
    }

    description(){
        return this.callee.description();
    }

    type(){
        const description = this.description();
        return description instanceof Stack ? description.type() : description;
    }

    check(){
        const type = this.type();
        if( this.callee.isThisExpression ){
            this.callee.throwError(`'${this.callee.value()}' is not constructable.`);
        }
        if( type.isModule && (type.isClass || type.isDeclarator) ){
            if( type.abstract ){
                this.callee.throwError(`'${this.callee.value()}' is an abstract class. cannot be instantiated.`);
            }
            return;
        }else{
            this.callee.throwError(`'${this.callee.value()}' is not class.`);
        }
    }

    parser(syntax){
        this.callee.parser(syntax);
        this.arguments.forEach( item=>item.parser(syntax) );
    }
}

module.exports = NewExpression;