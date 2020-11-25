const Stack = require("../Stack");
const Utils = require("../Utils");
const SpreadElement = require("./SpreadElement");
class ObjectExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.target = {};
        this.properties = node.properties.map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
            this.target[ stack.key.value() ] = stack.value;
            return stack;
        });
   }

   description(){
       return this.properties;
   }

   type(){
       return this.compilation.getType("Object");
   }

   parser(syntax)
   {
      this.properties.forEach( item=>{
          item.parser(syntax);
      });
   }

   value()
   {
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
                    const value = left.map( item=>item.value() ).join(",");
                    props.push(`{${value}}`);
                }
                props.push( `${spreadElement.value()}` );

            }while( (spreadElementIndex = properties.findIndex( item=>item instanceof SpreadElement ) ) >= 0 );

            if( properties.length > 0 )
            {
                const value = properties.map( item=>item.value() ).join(",");
                props.push( `{${value}}` );
            }

            let object = props.shift();
            while( props.length > 0 )
            {
                let prop = props.shift();
                object = `Object.assign(${object},${prop})`;
            }
            return object;

        }else{
            let props = properties.map( item=>item.value() ).join(",");
            return `{${props}}`;
        }
        
   }

   emit(syntax)
   {
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
                    const value = left.map( item=>item.emit(syntax) ).join(",");
                    props.push(`{${value}}`);
                }
                props.push( `${spreadElement.emit(syntax)}` );

            }while( (spreadElementIndex = properties.findIndex( item=>item instanceof SpreadElement ) ) >= 0 );

            if( properties.length > 0 )
            {
                const value = properties.map( item=>item.emit(syntax) ).join(",");
                props.push( `{${value}}` );
            }

            let object = props.shift();
            while( props.length > 0 )
            {
                let prop = props.shift();
                object = `Object.assign(${object},${prop})`;
            }
            return object;

        }else
        {
            let props = properties.map( item=>item.emit(syntax) ).join(",");
            return `{${props}}`;
        }
   }
}

module.exports = ObjectExpression;