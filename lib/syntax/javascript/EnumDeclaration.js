const Syntax = require("./Syntax");
class EnumDeclaration extends Syntax{
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
    emit( syntax ){
        const inherit = this.stack.inherit ? this.stack.inherit.emit(syntax) : null;
        const properties = this.stack.properties.map( item=>{
            const key = item.value(syntax);
            const value = item.right.emit(syntax);
            return `"${key}":${value}`;
        });
        const key = this.stack.value();
        const objectValue = this.objectExpression(properties);
        const target = inherit ? `Object.assign(${inherit},${objectValue})` : objectValue;
        return this.semicolon(`var ${key} = ${target}`);
    }
}

module.exports = EnumDeclaration;