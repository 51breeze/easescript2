const Expression = require("./Expression");
class SuperExpression  extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isSuperExpression= true;
        node.name = "super";
        const parent = this.compilation.module.extends[0];
        if( !parent ){
            this.throwError(`'super' no inherit parent class`)
        }
        const fnScope = scope.getScopeByType("function");
        if( !fnScope.isMethod ){
            this.throwError(`'super' can only be referenced in class method`)
        }
        if( fnScope.isConstructor && !fnScope.hasSuper ){
            fnScope.firstSuperIndex = parentStack.childrenStack.length;
            fnScope.hasSuper = true;
        }
    }
    reference(){
        return this;
    }
    description(){
        const fnScope = this.scope.getScopeByType("function");
        if( fnScope.isConstructor && !this.parentStack.isMemberExpression ){
           const parent = this.compilation.module.extends[0];
           if( parent.methodConstructor ){
               return parent.methodConstructor;
           }else{
               return {
                    params:[],
                    callable:true,
                    isConstructor:true,
                    stack:this,
                    description(){
                        return this;
                    },
                    type(){
                        return parent;
                    }
                }
           }
        }
        return this;
    }
    type(){
        return this.compilation.module.extends[0];
    }
    check(){
        const parent = this.compilation.module.extends[0];
        if( !parent ){
            this.throwError("Super no inherit parent class")
        }
    }
    value(){
        return `super`;
    }
    raw(){
        return `super`; 
    }
    parser(){}
}

module.exports = SuperExpression;