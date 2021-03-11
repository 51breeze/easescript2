const Utils = require("../Utils");
const Expression = require("./Expression");
const UnionType = require("../UnionType");
class CallExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isCallExpression= true;
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
        this.genericity=null;
        if( node.genericity ){
            this.genericity = node.genericity.map(item=>Utils.createStack(compilation,item,scope,node,this));
        }
    }

    definition(){
        const type = this.type().toString();
        const identifier = this.callee.value();
        const context = this.description();
        const owner   = context.compilation.module.getName();
        const params  = context.params.map(item=>item.raw());
        return {
            kind:"call",
            comments:context.comments,
            identifier:identifier,
            expre:`${owner}.${context.value()}(${params.join(",")}):${type}`,
            type:type,
            start:this.callee.node.start,
            end:this.callee.node.end,
            file:context.compilation.module.file,
            context
        };
    }

    reference(){
        const description = this.callee.description();
        if( description.isFunctionExpression || description.isMethodDefinition){
            const returnItem = description.scope.returnItems[0];
            return returnItem && returnItem.reference();
        }
        if(description.isModule && description.methodConstructor){
            const returnItem = description.methodConstructor.scope.returnItems[0];
            return returnItem && returnItem.reference();
        }
        if( description.isDeclarator && description.isStack ){
            return description.reference();
        }
        return null;
    }

    referenceItems(){
        const description = this.callee.description();
        if( description.isFunctionExpression || description.isMethodDefinition){
            return description.referenceItems();
        }else if(description.isModule && description.methodConstructor){
            return description.methodConstructor.referenceItems();
        }
        return [];
    }

    description(){
        let desc = this.callee.description();
        if( !desc )return null;
        if( desc.isDeclarator && desc.isStack ){
            desc = desc.description();
        }else if( desc.isModule ){
            desc = desc.callable;
        }
        return desc;
    }

    value(){
        return this.callee.value();
    }

    type(){
        const description = this.description();
        if( !description.isAccessor && description.isMethodDefinition){
            const event = {type:null,target:null};
            this.callee.dispatcher("FETCH_TUPLE_TYPE",event);
            if(event.type && event.target===description){
                return new UnionType(event.type.elements);
            }
        }
        const type = description.type();
        if( type.isGenericType && type.acceptType ){
            return type.acceptType;
        }
        return type;
    }

    throwError(message){
        this.callee.throwError(message);
    }

    throwWarn(message){
        this.callee.throwWarn(message);
    }

    check(grammar){
        if(this.checked)return;
        this.checked = true;
        let description = this.description(grammar);
        if( !description  ){
            this.throwError(`"${this.raw()}" is not exists`);
        }
        if( description.isAny ){
            return;
        }
        if( !description.callable && !this.callee.isSuperExpression ){
            this.throwError(`"${this.raw()}" is not callable`);
        }
        const length = description.params.length;
        if( this.genericity ){
            if( !description.genericity ){
                const method = description.isFunctionExpression ? 'function' : 'method';
                this.throwError(`No declaration generic of the "${this.raw()}" ${method}, so to be not assign generic`);
            }
            const declareGenerics = description.genericity.elements;
            if( declareGenerics.length !== this.genericity.length ){
                const method = description.isFunctionExpression ? 'function' : 'method';
                this.throwError(`Generic of the "${this.raw()}" ${method}, expected to be 0 or ${declareGenerics.length}. but got ${this.genericity.length}`);
            }
            declareGenerics.forEach( (item,index)=>{
                const result = item.type().check( this.genericity[index] );
                if( !result ){
                    this.throwError(`Type '${this.genericity[index].type().toString()}' does not satisfy the constraint '${item.type().toString()}'.`);
                }
            });
        }
        if( length > 0 ){
            const event = {type:null,target:null};
            this.callee.dispatcher("FETCH_TUPLE_TYPE",event);
            const rest = description.params[ length-1 ].isRestElement ? description.params[ length-1 ] : null;
            const args = this.arguments.map( (item,index)=>{
                if( description.params[index] && description.params[index] !== rest ){
                    let acceptType = description.params[index].type();
                    if( event.type && event.target===description ){
                        acceptType = event.type;
                    }
                    let isGeneric = false;
                    if( acceptType.isGenericType ){
                        isGeneric = true;
                        if( this.genericity && this.genericity[index]){
                            acceptType.accept( this.genericity[index].type() );
                        }else{
                            acceptType.accept( item.type() );
                        }
                    }
                    if( acceptType && !acceptType.check(item,true) ){
                        if( acceptType.hasConstraint ){
                            item.throwError(`the '${item.raw()}' argument cannot satisfy the constraint of '${acceptType.toString()}'`);
                        }else{
                            item.throwError(`the '${item.raw()}' argument type does not match the parameter type '${acceptType.toString()}' specified in the function`);
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
                if( item.isAssignmentPattern || item.isRestElement ){
                    return true;
                }
                return !!args[index];
            });

            if( !check ){
                this.throwError(`Missing arguments, give ${args.length}, expect ${description.params.length}.`);
            }
        }
    }
    parser(grammar){
        this.check(grammar);
        this.callee.parser(grammar);
        this.arguments.forEach(item=>item.parser(grammar));
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
}

module.exports = CallExpression;