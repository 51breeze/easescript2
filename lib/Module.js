const Type = require("./Type");
const path = require("path");
const Utils = require("./Utils");
class Module extends Type{
    constructor( compliler ){
        super(null,null);
        this.compliler=compliler;
        this.compilation=null;
        this.ast = null;
        this.grammar=null;
        this.file = "";
        this.source = "";
        this.static = false;
        this.abstract = false;
        this.namespace = null;
        this.modifier = "public";
        this.implements=[];
        this.methods={};
        this.members={};
        this.annotations =[];
        this.metatypes = [];
        this.making = false;
        this.dependence=new Map();
        this.imports=new Map();
        this.callable = null;
        this.isModule = true;
        this.methodConstructor = null;
        this.used = false;
        this.children = [];
        this.comments = null;
        this.nodeStacks = new Map();
        this.nodeLines  = new Map();
    }
    addNodeStack( stack ){
        this.nodeStacks.set(stack.node.start,stack);
        if( stack.node.loc ){
            this.nodeLines.set(stack.node.loc.start.line, stack.node.start);
        }
    }
    definition(){
        const find=(root)=>{
            for(var i=0;i<root.body.length;i++){
                const stack = root.body[i];
                if( !stack )return null;
                if( stack.isClassDeclaration || stack.isDeclaratorDeclaration || stack.isInterfaceDeclaration ){
                    return stack;
                }
                let result = find( stack );
                if( result ){
                    return result;
                }
            }
        }
        const stack = find(this.compilation.stack);
        if( stack ){
            const kind = this.isInterface ? "Interface" : "Class";
            return {
                kind:"Module",
                comments:this.comments,
                identifier:stack.id.value(),
                expre:`(${kind}) ${this.getName()}`,
                location:stack.id.getLocation(),
                file:this.file,
                context:stack
            };
        }
        return null;
    }
    getStackByAt( startAt, trys=3, both=0){
        let stack = this.nodeStacks.get( startAt );
        if( !stack ){
            let offset = 0;
            if(trys < 0){
                trys =  this.source.length / 2;
            }
            while(!stack && offset < trys){
                offset++;
                if( both === 0 ){
                   stack = this.nodeStacks.get( startAt - offset ) || this.nodeStacks.get( startAt + offset );
                }else if( both < 0 ){
                   stack = this.nodeStacks.get( startAt - offset )
                }else if( both > 0){
                   stack = this.nodeStacks.get( startAt + offset )
                }
            }
        }
        return stack;
    }

    checkClassName( className ){
        const info = path.parse( this.file );
        return info && info.name === className;
    }
    getName(){
        if( this.namespace ){
           return this.namespace.getChain().concat(this.id).join(".")
        }
        return this.id;
    }
    is( type ){
        if( !type )return false;
        if( type.isGenericType ){
            type = type.extends[0] || type.acceptType;
        }
        const left  = this;
        const right = type;
        if( (left===right) || (left.id==="Class" && left.isDeclarator && right.isModule && right.isClass) ){
            return true;
        }
        if( right.id==="Class" && right.isDeclarator && left.isModule && left.isClass){
            return true;
        }
        if( right.id==="Object" && right.isDeclarator && left.isModule && !Utils.isScalar(left) ){
            return true;
        }
        const check = (left,right)=>{
            if( left === right || (left.namespace === right.namespace && left.id === right.id) ){
                return true;
            }
            if(left.extends && left.extends.some(parent=>check(parent, right))){
                return true;
            }
            if(left.implements && left.implements.length > 0){
                return left.implements.some(item=>check(item,right));
            }
            return false;
        }
        return check(left,right);
    }

    publish(){
        const alias = this.metatypes.find( item=>item.name==="Alias" );
        if( alias ){
            const metatype = {};
            alias.params.forEach( item=>{
                const name  = item.value ? item.name : "name";
                const value = item.value ? item.value : item.name;
                metatype[ name ] = value;
            });
            this.alias = metatype.name;
            this.namespace.set(metatype.name, this);
            if( Boolean(metatype.origin) !== false ){
               this.namespace.set(this.id, this);
            }
        }else{
            this.namespace.set(this.id, this);
        }
    }

    getMethod( name, kind=null){
        const target = Object.prototype.hasOwnProperty.call(this.methods,name) ? this.methods[name] : null;
        if( target && target.isAccessor ){
            return kind =="set" ? target.set : target.get;
        }
        return target;
    }

    getMember( name, kind=null){
        let members = this.members;
        let inherit  = this;
        while( !Object.prototype.hasOwnProperty.call(members,name) ){
            if( inherit.extends[0] && inherit.members){
                inherit = inherit.extends[0];
                members = inherit.members;
            }else{
                inherit = this.compilation.getType("Object");
                members = inherit.members;
                break;
            }
        }
        let target = members && Object.prototype.hasOwnProperty.call(members,name) ? members[name] : null;
        if( target && target.isAccessor ){
            return kind =="set" ? target.set : target.get;
        }
        return target;
    }

    addDepend(name,value){
        this.dependence.set(name, value);
    }

    getDepend(name){
        return this.dependence.get(name);
    }

    addMember(name, desc){
        if(name ==="constructor" || name==this.id){
            this.methodConstructor =  desc;
        }else{
            const target = desc.static ? this.methods : this.members;
            if( desc.kind ==="get" || desc.kind ==="set" ){
                const obj = Object.prototype.hasOwnProperty.call(target,name) ? target[ name ] : (target[ name ]={isAccessor:true});
                if( Object.prototype.hasOwnProperty.call(obj,desc.kind) ){
                    desc.throwError(`the '${name}' already exists.`);
                }
                obj[ desc.kind ] = desc;
            }else{
                if( Object.prototype.hasOwnProperty.call(target,name) ){
                    desc.throwError(`the '${name}' already exists.`);
                }
                target[ name ] = desc;
            }
        }
    }

    addImport(name, module){
        this.imports.set(name, module);
    }

    getImport(name){
        return this.imports.get(name);
    }

    toString(){
        return this.namespace.getChain().concat( this.id ).join(".");
    }
}
module.exports = Module;