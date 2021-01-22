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
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
        this.callable = true;
        this[returnTypeKey] = null;
        this.insertBefore = [];
        scope.addListener("insertBefore",(content)=>{
            if( content ){
                this.insertBefore.push(content);
            }
        });
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

   emit(syntax){
       this.check();
       this.awaitCount = 0;
       const body = this.body.emit(syntax);
       const isSupport = syntax.makeFunctionParamSupportDefaultValue();
       const len = this.params.length;
       const rest = syntax.makeFunctionParamSupportRest() ? null : Utils.isStackByName(this.params[ len-1 ],"RestElement",true);
       const paramItems = rest ? this.params.slice(0,-1) : this.params;
       const before = [];
       const params = paramItems.map( item=>{
           const expre = item.emit( syntax );
           if( isSupport ){
               return expre;
           }
           const name = item.value();
           if( item.right ){
               const defauleValue = item.right.emit(syntax);
               before.push( `${name} = ${name} === void 0 ? ${defauleValue} : ${name}` );
           }
           return name;
       });
       const returnType = this.returnType ? this.returnType.value(syntax) : null;
       const key = this.key ? this.key.value() : null;
       if( rest ){
            before.push( `var ${rest.value()} = arguments.slice(${len-1})` );
       }
       if( this.scope.arrowThisName && !this.scope.isArrow ){
            before.push( `var ${this.scope.arrowThisName} = this` );
       }

       if( this.async ){
            const name = key ? ` ${key}` : '';
            const returnItem = this.scope.returnItems.length < 1 ? `\r\nreturn [2];` : '';
            if( this.awaitCount > 0 ){
                const hand = this.generatorVarName();
                return `function${name}(){
                    ${before.join(";\r\n")}
                    return __awaiter(this, void 0, void 0, function () {
                        ${this.insertBefore.join(";\r\n")}
                        return __generator(this, function (_a) {
                            switch (${hand}.label) {
                                case 0 :
                                ${body}
                                ${returnItem}
                            }
                        });
                    });
                }`;
            }else{
                return `function${name}(){
                    ${before.join(";\r\n")}
                    return __awaiter(this, void 0, void 0, function () {
                        ${this.insertBefore.join(";\r\n")}
                        return __generator(this, function (_a) {
                            ${body}
                            ${returnItem}
                        });
                    });
                }`;
            }
       }

       if( this.isArrowFunction && this.isExpression ){
           return syntax.makeFunctionExpression(this.scope, before.concat(this.insertBefore,`return ${body}`).join("\r\n"), key, params, returnType);
       }

       return syntax.makeFunctionExpression(this.scope, before.concat(this.insertBefore,body).join("\r\n"), key, params, returnType);
   }

}

module.exports = FunctionExpression;