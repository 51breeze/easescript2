const Scope = require("../Scope.js");
module.exports = class TopScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
        this.arrowThisName =  null;
    }

    type( name )
    {
        return name === "top";
    }

    createThisName(){
        if( this.arrowThisName ){
            return this.arrowThisName;
        }else{
            let name = "$this";
            let count = 0;
            const check = (item)=>{
                if( !item.type("function") ){
                    if( item.declarations.has( name ) ){
                        return true;
                    }else{
                        return item.children.some( check );
                    }
                }
            };
            while( this.declarations.has( name ) || this.children.some( check ) ){
                count++;
                name=`$this${count}`;
            }
            this.arrowThisName = name;
            return name;
        }
    }
} 