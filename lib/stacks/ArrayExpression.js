const Stack = require("../Stack");
const Utils = require("../Utils");
const SpreadElement = require("./SpreadElement");
const Expression = require("./Expression");
class ArrayExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
    }

    attribute(index){
        return this.elements[index] || null;
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return this.compilation.getType("Array");
    }

    parser( syntax ){

        const objectType = this.compilation.getType("Object");
        this.elements.forEach( item=>{
            if( item instanceof SpreadElement ){
               const type= item.type();
               if( !type || !( type.is( this.type() ) || type.is(objectType) ) ){
                   this.compilation.throwErrorLine("At {code} SpreadElement must is Array", item.node )
               }
            }
            item.parser(syntax);
        });
    }

    emit( syntax ){ 
        let elements = this.elements.slice(0);
        let spreadElementIndex = elements.findIndex( item=>item instanceof SpreadElement );
        if( spreadElementIndex >=0 ){
            let props = [];
            do{
                const [spreadElement] = elements.splice(spreadElementIndex, 1);
                const left  = elements.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 )
                {
                    props.push( syntax.makeArrayExpression(this.scope, left.map( item=>item.emit(syntax) ) ) );
                }
                props.push(spreadElement.emit(syntax));
            }while( (spreadElementIndex = elements.findIndex( item=>item instanceof SpreadElement ) ) >= 0 );
            if( elements.length > 0 ){
                props.push( syntax.makeArrayExpression(this.scope, elements.map( item=>item.emit(syntax) ) ) );
            }
            return syntax.makeSpreadArrayExpression(this.scope,props);
        }else{
            return syntax.makeArrayExpression(this.scope,elements.map( item=>item.emit(syntax) ) );
        }
    }
}

module.exports = ArrayExpression;