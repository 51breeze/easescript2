const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
const FunctionExpression = require("./FunctionExpression");
const MethodDefinition = require("./MethodDefinition");
const UnionType = require("../UnionType");
const TupleType = require("../TupleType");
class CallExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
        this.genericity=null;
        if( node.genericity ){
            this.genericity = node.genericity.map(item=>Utils.createStack(compilation,item,scope,node,this));
        }
    }

    reference(){
        const description = this.callee.description();
        if( description instanceof FunctionExpression || description instanceof MethodDefinition){
            return description.scope.returnItems.map( item=>item.reference() ).filter(item=>!!item);
        }
        if( description instanceof Module && description.constructor instanceof MethodDefinition){
            return description.constructor.scope.returnItems.map( item=>item.reference() ).filter(item=>!!item);
        }
        return null;
    }

    description(){
        let desc = this.callee.description();
        if( Utils.isStackByName(desc,"Declarator") ){
            desc = desc.description();
        }else if( desc instanceof Module ){
            desc = desc.callable;
        }
        return desc;
    }

    value(){
        return this.callee.value();
    }

    type(){
        const description = this.description();
        if( !description.isAccessor && Utils.isStackByName(description,"MethodDefinition") ){
            const event = {type:null,target:null};
            this.callee.dispatcher("FETCH_TYPE",event);
            if( event.type && event.target===description && event.type instanceof TupleType ){
                return new UnionType(event.type.elements);
            }
        }
        const type = description.type();
        if( type.isGenericType && type.acceptType ){
            return type.acceptType;
        }
        return type;
    }

    getSpreadRefName( syntax ){
        if( this.__spreadRefName ){
            return this.__spreadRefName;
        }
        const expression = this.emit(syntax);
        const block = this.getParentStackByName("BlockStatement");
        const refName =  this.scope.generateVarName("$callee");
        block.dispatcher("insertBefore",`var ${refName} = ${expression}`);
        this.__spreadRefName = refName;
        return refName;
    }

    throwError(message){
        this.callee.throwError(message);
    }

    throwWarn(message){
        this.callee.throwWarn(message);
    }

    check(){
        let description = this.description();
        if( !description  ){
            this.throwError(`"${this.raw()}" is not exists`);
        }
        if( description.isAny ){
            return;
        } 
        if( !description.callable ){
            this.throwError(`"${this.raw()}" is not callable`);
        }
        const length = description.params.length;
        if( this.genericity ){
            if( !description.genericity ){
                const method = Utils.isStackByName(description,"FunctionExpression") ? 'function' : 'method';
                this.throwError(`No declaration generic of the "${this.raw()}" ${method}, so to be not assign generic`);
            }
            const generics = description.genericity.elements.length;
            if( description.genericity.elements.length !== this.genericity.length ){
                const method = Utils.isStackByName(description,"FunctionExpression") ? 'function' : 'method';
                this.throwError(`Generic of the "${this.raw()}" ${method}, expected to be 0 or ${generics}. but got ${this.genericity.length}`);
            }
        }

        if( length > 0 ){
            const event = {type:null,target:null};
            this.callee.dispatcher("FETCH_TYPE",event);
            const rest = Utils.isStackByName(description.params[ length-1 ],"RestElement" ) ? description.params[ length-1 ] : null;
            const args = this.arguments.map( (item,index)=>{
                if( description.params[index] && description.params[index] !== rest ){
                    let acceptType =  event.type && event.target===description ? event.type : description.params[index].type();
                    if( acceptType.isGenericType ){
                        acceptType.acceptType = item.type();
                    }
                    let isGenericity = false;
                    if( this.genericity && this.genericity[index] ){
                        acceptType =this.genericity[index].type();
                        isGenericity = true;
                    }
                    if( acceptType && !acceptType.check(item, acceptType.isTupleType) ){
                        let valueType = item.type().toString();
                        if( acceptType.isTupleType ){
                            const ref = item.reference();
                            if( Utils.isStackByName(ref,"ArrayExpression" ) ){
                                valueType = (new TupleType( ref.elements.map( item=>item.type() ) )).toString();
                            }
                        }
                        if( isGenericity ){
                            this.throwError(`Generics specified as "${acceptType.toString( !!event.tupleType  )}" cannot accept a "${valueType}" argument.`);
                        }else{
                            this.throwError(`"${description.params[index].value()}" argument of type ${acceptType.toString( !!event.tupleType  )} is not assignable to parameter of type ${valueType}.`);
                        }
                    }
                }
                return item;
            });

            if( rest ){
               const tupleType = rest.type();
               if( tupleType.requireCount > 0 && args.length < tupleType.requireCount ){
                  this.throwError(`"${this.raw()}" missing arguments`);
               }
               if( !tupleType.check( args.slice( length-1 ) ) ){
                  const argTypes = args.slice( length-1 ).map( item=>item.type().toString() )
                  this.throwError(`"${rest.value()}" argument of type '${tupleType.toString()}' is not assignable to parameter of type '${argTypes.join(",")}'.`);
               }
            }

            const check = description.params.every( (item,index)=>{
                if( Utils.isStackByName(item,"AssignmentPattern") || Utils.isStackByName(item,"RestElement" ) ){
                    return true;
                }
                return !!args[index];
            });

            if( !check ){
                this.throwError(`"${this.raw()}" missing arguments`);
            }
        }
    }

    parser(syntax){
        this.callee.parser(syntax);
        this.arguments.forEach(item=>item.parser(syntax));
        this.check();
    }

    raw(){
        const callee= this.callee.raw();
        const args = this.arguments.map( item=>item.raw() );
        if( this.genericity ){
            const genericity = this.genericity.map( item=>item.raw() );
            return `${callee}<${genericity.join(",")}>(${args.join(",")})`;
        }
        return `${callee}(${args.join(",")})`;
    }

    emit( syntax ){
        this.check();
        const callee= this.callee.emit(syntax);
        const args = this.arguments.map( item=>item.emit(syntax) );
        if( Utils.isStackByName(this.callee.object,"SuperExpression") ){
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }
        return `${callee}(${args.join(",")})`;
    }
}

module.exports = CallExpression;