class Namespace {

    constructor( id ){
        this.modules = new Map();
        this.children = new Map();
        this.identifier = id;
        this.parent = null;
    }
    
    set( name , value){
        this.modules.set( name, value);
    }

    get( name ){
        return this.modules.get( name );
    }

    toString(){
        return this.getChain().join(".");
    }

    getChain(){
        if( this.parent ){
            return this.parent.getChain().concat(this.identifier);
        }
        return [];
    }

    getChildrenKeys(){
        const children = [];
        this.children.forEach((value,key)=>{
            const obj = {};
            obj[key] = value.getChildrenKeys();
            children.push(obj);
        });
        return children;
    }

    static getStructure(){
       return Namespace.dataset.getChildrenKeys();
    }

    static create( id ){
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
                const np = new Namespace( key ); 
                np.parent = base;
                base.children.set(key, np);
                base = np;
            }
       }
       return base;
    }

    static fetch( id , base ){
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