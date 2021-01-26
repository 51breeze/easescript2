const Syntax = require("./Syntax");
class ObjectExpression extends Syntax{
    objectExpression(properties){
        return `{${properties.join(",")}}`;
    }
    objectMerge(props){
        let object = props.shift();
        while( props.length > 0 ){
            let prop = props.shift();
            object = `Object.assign(${object},${prop})`;
        }
        return object;
    }
    emit(syntax){
        let properties = this.stack.properties.slice(0);
        let spreadElementIndex = properties.findIndex( item=>item.isSpreadElement );
        if( spreadElementIndex >=0 )
        {
            let props = [];
            do{
                const [spreadElement] = properties.splice(spreadElementIndex, 1);
                const left  = properties.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 )
                {
                    props.push( this.objectExpression( left.map( item=>item.emit(syntax) ) ) );
                }
                props.push( `${spreadElement.emit(syntax)}` );

            }while( (spreadElementIndex = properties.findIndex( item=>item.isSpreadElement ) ) >= 0 );

            if( properties.length > 0 )
            {
                props.push( this.objectExpression( properties.map( item=>item.emit(syntax) ) ) );
            }
            return this.objectMerge(props);
        }else
        {
            return this.objectExpression( properties.map( item=>item.emit(syntax) ) );
        }
    }
}

module.exports = ObjectExpression;