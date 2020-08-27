const Stack = require("./Stack.js");
module.exports = class Scope extends Stack{
   
    constructor( parent )
    {
        super( parent );
        this.declarations=new Map();
    }

    type( name )
    {
        return false;
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
        if( !type )
        {
            let has = this.declarations.has( name );
            if( !has )
            {
                let parentScope = this.parent;
                do{
                    if( parentScope instanceof Scope && parentScope.declarations.has(name) )
                    {
                        return parentScope.declarations.get(name);
                    }else{
                        parentScope = parentScope.parent; 
                    }
                } while( parentScope );
                return null;
            }
            return this.declarations.get(name);
        }
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
        }
        return has;
    }
};