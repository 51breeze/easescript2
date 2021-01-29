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
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
        this.callable = true;
        this[returnTypeKey] = null;
   }

   generatorVarName(){
       return this._generatorVarName || (this._generatorVarName = this.scope.generateVarName("$a"));
   }

   reference(){
       return this.scope.returnItems.map( item=>item.reference() ).filter( item=>!!item );
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
                this.throwError("Constructor does not need to return an expression");
            }
        }else if( this.returnType ){
            this.returnType.check();
            const isVoid = this.returnType.type() === this.compilation.getType("void");
            if( isVoid && this.scope.returnItems.length > 0 ){
                this.throwError("Void does not need to return an expression");
            }else if( !isVoid && this.scope.returnItems.length < 1 ){
                this.throwError("Missing return expression");
            }
        }
        this.params.forEach( item=>item.check() );
   }

   parser(syntax){
        this.params.forEach( item=>item.parser(syntax) );
        this.returnType && this.returnType.parser(syntax);
        this.body.parser(syntax);
        this.check();
   }
}

module.exports = FunctionExpression;