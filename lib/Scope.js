const Stack = require("./Stack");
module.exports = class Scope extends Stack{
   
    constructor( parent )
    {
        super( parent );
        this.declarations=new Map();
    }

    type( name )
    {
        return name==="top";
    }

    getScopeByType( name )
    {
        let obj = this;
        while( obj instanceof Scope && !obj.type( name ) && obj.parent )
        {
            obj = obj.parent;
        }
        return obj;
    }

    define(name, type)
    {
        this.declarations.set(name,type);
    }

    isDefine( name )
    {
        let has = this.declarations.has( name );
        
        if( !has )
        {
            let parentScope = this.parent;
            while( parentScope && !(parentScope instanceof Scope) )
            {
                parentScope = parentScope.parent;
            }
            if( parentScope )
            {
                return parentScope.isDefine( name );
            }

            if( name == "i")
            {
               
                console.log(  this.parent )

            }

           


        }
        return has;
    }
};