const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
const FunctionExpression = require("./FunctionExpression");
const MethodDefinition = require("./MethodDefinition");
class CallExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
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
        let description = this.callee.description();
        if( description instanceof Module ){
            description = description.callable;
        }
        return description;
    }

    value(){
        return this.callee.value();
    }

    raw(){
        return this.callee.raw();
    }

    type(){
        const description = this.description();
        return description.type();
    }

    parser(syntax){
        this.callee.parser(syntax);
        let description = this.description();
        if( !description  ){
            this.throwError(`"${this.raw()}" is not exists`);
        } 
        if( !description.callable ){
            this.throwError(`"${this.raw()}" is not callable`);
        }
        const length = description.params.length;
        if( length > 0 ){
            const restParam = Utils.isStackByName(description.params[ length-1 ],"RestElement" ) ? description.params[ length-1 ] : null;
            const args = this.arguments.map( (item,index)=>{
                item.parser(syntax);
                if( description.params[index] && description.params[index] !== restParam ){
                    const acceptType = description.params[index].type();
                    if( acceptType && !acceptType.is( item.type() ) ){
                        this.throwError(`"${item.raw()}" params type is not match`);
                    }
                }
                return item;
            });

            if( restParam ){
               if( !restParam.type().check( args.slice( length-1 ) ) ){
                   this.throwError(`"${item.raw()}" params type is not match`);
               }
            }

            const check = description.params.every( (item,index)=>{
                return !!(item.initValue===null ? args[index] : true);
            });

            if( !check ){
                this.error(`"${this.raw()}" missing arguments`, node, this.raw());
            }
        }
    }

    emit( syntax ){
        const callee= this.callee.emit(syntax);
        const args = this.arguments.map( item=>item.emit(syntax) );
        return syntax.makeCallExpression(callee,args);
    }
}

module.exports = CallExpression;