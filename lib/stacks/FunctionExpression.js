const Utils = require("../Utils");
const Declarator = require("./Declarator");
const FunctionScope = require("../scope/FunctionScope");
const Expression = require("./Expression");
const UnionType = require("../UnionType");
const returnTypeKey = Symbol("returnTypeKey");
class FunctionExpression extends Expression{
    constructor(compilation,node,scope,parentNode,parentStack){
        scope = new FunctionScope(scope); 
        super(compilation,node,scope,parentNode,parentStack);
        if( parentStack && parentStack.isMethod){
            scope.isMethod=true;
            if( parentStack.isConstructor ){
                scope.isConstructor = true;
                this.isConstructor = true;
            }
        }
        this.isFunctionExpression=true;
        this.genericity = Utils.createStack(compilation, parentNode.key && parentNode.key.genericity ? parentNode.key.genericity : node.genericity,scope,node,this);
        this.returnType= Utils.createStack(compilation,node.returnType,scope,node,this);
        let assignment = null;
        this.params    = node.params.map( item=>{
            if( item.type =="Identifier" ){
                const stack = new Declarator(compilation,item,scope,node,this);
                if( assignment ){
                    assignment.throwError(`the "${assignment.value()}" parameter with an initial value in method can only be declared after the parameter`); 
                }
                scope.define(stack.value(), stack);
                return stack;
            }else{
                const stack = Utils.createStack(compilation,item,scope,node,this);
                assignment = stack;
                if( compilation.module.isInterface ){
                    stack.throwError(`the "${stack.value()}" parameter of the interface method, cannot be set to default value`);
                }
                return stack;
            }
        });
        this.awaitCount = 0;
        this.async = scope.async =!!node.async;
        if( this.async ){
            scope.asyncParentScopeOf = scope;
        }
        if( !parentStack.isMethod ){
            this.callable = true;
        }
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
        this[returnTypeKey] = null;
    }
    generatorVarName(){
        return this._generatorVarName || (this._generatorVarName = this.scope.generateVarName("_a"));
    }
    reference(){
        return this.scope.returnItems[0].reference();
    }
    referenceItems(){
        let items = [];
        this.scope.returnItems.forEach( item=>{
            items = items.concat( item.referenceItems() );
        })
        return items;
    }
    description(){
        return this;
    }
    type(){
        if( this.returnType ){
            return this.returnType.type();
        }
        if( this.scope.returnItems.length < 1 ){
            return this.compilation.getType("any");
        }
        if( this.scope.returnItems.length === 1 ){
            return this.scope.returnItems[0].type();
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
        return this[returnTypeKey]=new UnionType( items.map( item=>item.type() ) );
    }

    check(){
        if( this.isConstructor ){
            if( this.scope.returnItems.length > 0 ){
                const last = this.scope.returnItems[ this.scope.returnItems.length-1 ]
                last.throwError("Constructor does not need to return an expression");
            }
            if( this.compilation.module.extends[0] && this.scope.firstSuperIndex != 1){
                (this.body.childrenStack[0]||this.key).throwError("The first expression of the constructor must call super.");
            }
        }else if( this.returnType ){
            this.returnType.check();
            const isVoid = this.returnType.type() === this.compilation.getType("void");
            if( isVoid && this.scope.returnItems.length > 0 ){
                this.returnType.throwError("Void does not need to return an expression");
            }else if( !isVoid && this.scope.returnItems.length < 1 ){
                this.returnType.throwError("Missing return expression");
            }
        }
    }

    parser(grammar){
        this.check(grammar);
        this.params.forEach( item=>item.parser(grammar) );
        this.body.parser(grammar);
    }
}

module.exports = FunctionExpression;