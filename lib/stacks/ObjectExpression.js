const Utils = require("../Utils");
const SpreadElement = require("./SpreadElement");
const Expression = require("./Expression");
class ObjectExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.properties = node.properties.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
    }

    attribute(name){
        return this.properties.find( item=>item.key.value() == name );
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return this.compilation.getType("Object");
    }

    parser(syntax){
        this.properties.forEach( item=>{
            item.parser(syntax);
        });
    }

    check(){
        this.properties.forEach( item=>{
            item.check();
        });
    }

    value(){
        return super.raw();
    }

    emit(syntax){
        this.check();
        let properties = this.properties.slice(0);
        let spreadElementIndex = properties.findIndex( item=>item instanceof SpreadElement );
        if( spreadElementIndex >=0 )
        {
            let props = [];
            do{
                const [spreadElement] = properties.splice(spreadElementIndex, 1);
                const left  = properties.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 )
                {
                    props.push( syntax.makeObjectExpression(this.scope, left.map( item=>item.emit(syntax) ) ) );
                }
                props.push( `${spreadElement.emit(syntax)}` );

            }while( (spreadElementIndex = properties.findIndex( item=>item instanceof SpreadElement ) ) >= 0 );

            if( properties.length > 0 )
            {
                props.push( syntax.makeObjectExpression(this.scope, properties.map( item=>item.emit(syntax) ) ) );
            }
            return syntax.makeObjectMerge(this.scope,props);
        }else
        {
            return syntax.makeObjectExpression(this.scope,properties.map( item=>item.emit(syntax) ) );
        }
    }
}

module.exports = ObjectExpression;