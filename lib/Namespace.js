class Namespace {

    constructor( id )
    {
        this.modules = new Map();
        this.children = new Map();
        this.identifier = id;
    }

    set( name , value)
    {
        this.modules.set( name, value);
    }

    get( name )
    {
        return this.modules.get( name );
    }

    static create( id )
    {
       if( !id ) 
       {
           return Namespace.dataset;
       }
       const items = id.split(".");
       let key = null;
       let base = Namespace.dataset;
       let identifier = [];
       while( key = items.shift() )
       {
            identifier.push(key);
            if( base.children.has(key) ){
                base = base.children.get(key);
            }else{
                const np = new Namespace( identifier.join(".") ); 
                base.children.set(key, np);
                base = np;
            }
       }
       return base;
    }

    static fetch( id , base )
    {
        if( !id ) 
        {
            return Namespace.dataset;
        }
        
       const items = id.split(".");
       const name  = items.pop();
       let   key   = null;
       base = base || Namespace.dataset;
       while( (key = items.shift()) && base )
       {
            base = base.children.has(key) ? base.children.get(key) : null;
       }

       if( !base || !(base instanceof Namespace) )
       {
           return null;
       }
       return base.children && base.children.has(name) ? base.children.get(name) : base.get( name );
    }
}
Namespace.dataset =new Namespace("");
module.exports = Namespace;