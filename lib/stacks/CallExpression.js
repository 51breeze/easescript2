const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
class CallExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
    }

    description(){
        let description = this.callee.description();
        if( description instanceof Module ){
            description = description.callable;
        }
        return description;
    }

    type(){
        const description = this.description();
        return description.type();
    }

    parser(syntax){
        this.callee.parser(syntax);
        let description = this.description();
        if( !description || !description.callable )
        {
            this.compilation.error(`"${this.raw()}" is not callable`, this.node, this.raw());
        } 

        const args = this.arguments.map( (item,index)=>{
           item.parser(syntax);
           if( description.params[index] )
           {
              const acceptType = description.params[index].type();
              if( acceptType && !acceptType.is( item.type() ) )
              {
                 this.compilation.error(`"${this.raw()}" params type is not match`, this.node, this.raw());
              }
           }
           return item;
        });

        const check = description.params.every( (item,index)=>{
            return !!(item.initValue===null ? args[index] : true);
        });

        if( !check ){
            this.error(`"${this.raw()}" missing arguments`, node, this.raw());
        }
    }

    emit( syntax ){
        const callee= this.callee.emit(syntax);
        const args = this.arguments.map( item=>item.emit(syntax) );
        return syntax.makeCallExpression(callee,args);
    }
}

module.exports = CallExpression;