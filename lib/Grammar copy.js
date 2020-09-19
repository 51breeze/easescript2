const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Namespace  = require("./Namespace.js");
const Type  = require("./Type.js");
const Enum  = require("./Enum.js");
const Union  = require("./Union.js");
const Module = require("./Module.js");

class Grammar {

    constructor(compilation)
    {
       this.compilation = compilation;
       this.module = compilation.module;
       this.annotations = [];
       this.metatypes   = [];
       this.scope=null;
    }

    error(message, node)
    {
        this.compilation.throwError(message, node.start );
    }

    MemberExpression(node,scope,parent,flag=true)
    {
        const member = [];
        let base     = null;
        let isStatic = false;
        const chain  = [];
        const check=(name, base)=>{

            if( base === null && scope.isDefine( name ) )
            {
                return scope.define( name );
            }
            base = this.compilation.getReference(name, base, isStatic);
            if( !base )
            {
                this.error( `"${member.join(".")}" is not defined.`, node );
            }
            return base;
        }

        const memberExpression = (node)=>{
            let name =node.property.name;
            if( node.object.type ==="MemberExpression" )
            {
                memberExpression( node.object );

            }else
            {
                if( node.object.type ==="ThisExpression" )
                {
                   const desc = this.ThisExpression(node.object,scope,node);
                   member.push( desc.thisName );
                   base = desc.description;

                }else
                { 
                    member.push( node.object.name );
                    if( flag !== false )
                    {
                       base = check(node.object.name, base);
                    }
                }
               
                if( member.length===1 && base instanceof Module && base.id == member[0] )
                {
                    isStatic = true;
                }

                chain.push( base );
            }
            member.push( name );
            if( flag !== false )
            {
                base = check(name,base);
                chain.push( base );
            }
            return member;
        }

        memberExpression( node );
        return {node,member,chain,description:base};
    }

    ObjectExpression(node, scope, parent)
    {
        const target = {};
        const properties = node.properties.map( (child)=>{
            if( child.type ==="SpreadElement" )
            {
                return this.parser(child,scope,node);
            }
            const key = child.key.value || child.key.name;
            const value = this.parser(child.value,scope,child);
            target[ key ] = value;
            return {node:child,key,value};
        });
        const description = this.compilation.getType("Object");
        return {node,properties,target,description};
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        return this.FunctionExpression(node,scope,parent,true,!!node.expression);
    }

    parserFunctionParams(scope,items,parent)
    {
        const params=[];
        items.forEach( (item)=>{
            let name = "";
            let type = null;
            let defaultValue = void 0;
            let declar = null;
            if( item.type === "AssignmentPattern" )
            {
                name = item.left.name;
                type = this.parser(item.left.acceptType,scope,item);
                defaultValue = item.right ? this.parser(item.right,scope,item) : defaultValue;
                declar = new Parameter(item,name, defaultValue, type);
                this.setAssignment(declar, defaultValue );
                
            }else
            {
                name = item.name;
                type = this.parser(item.acceptType,scope,parent);
                declar = new Parameter(item, name, defaultValue, type, item.type === "RestElement");
            }
            params.push( declar );
            scope.define(name, declar);
        });
        return params;
    }

    FunctionExpression(node,scope,parent,isArrow,isExpression)
    {
        scope = new FunctionScope( scope, !!node.static , isArrow );
        let key = null;
        if( parent && parent.type ==="MethodDefinition" )
        {
            key = parent.key.name;
            if( !key && parent.kind === "constructor" )
            {
                key = "constructor";
            }

            if( !parent.static )
            {
               scope.define("this", this.module);
            }
        }
        scope.node = node;
        scope.key = key;
        scope.isExpression = isExpression;
        scope.returnType = this.parser(node.returnType,scope,node);
        scope.params     = this.parserFunctionParams(scope,node.params);
        scope.body = this.parser(node.body,scope,node);
        return scope;
    }

    ArrayExpression(node,scope, parent)
    {
        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        const description = this.compilation.getType("Array");
        return {node,elements,description};
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        const description = new Union(left.description,right.description);
        return {node,left,right,description};
    }

    AssignmentExpression(node, scope, parent)
    {
        const left = this.parser( node.left, scope, node );
        const right = this.parser( node.right, scope, node);
        const declar = left.description;
        if( !declar )
        {
            this.error( `"${left.value}" is not defined.`, node);
        }
        declar.assignment = right;
        return {node,left,right};
    }

    ThisExpression(node, scope, parent)
    {
        let fnScope = scope.getScopeByType("function");
        const description = fnScope.define( "this" );
        if( !description )
        {
            this.error( `"this" is not defined.`, node);
        }
        return {node,description};
    }

    BinaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const right = this.parser(node.right,scope,node);
         return {node,left,right};
    }

    CallExpression(node, scope, parent)
    {
        const target = this.parser(node.callee,scope,node);
        const description = target.description;
        const args = node.arguments.map( (item,index)=>{
           const val = this.parser(item,scope,node);
           if( description.params[index] )
           {
              this.compilation.checkType( description.params[index], val.type );
           }
           return val;
        });

        if( !description || !(description.kind ==="method" || description instanceof FunctionScope) )
        {
            this.error(`"${target}" is not method`, node);
        }        
        return {node,arguments:args,description};
    }

    NewExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const description = callee.description;
       
        if( !description instanceof Module )
        {
            const props = callee.member ? callee.member.join(".") : callee.value;
            this.error(`"${props}" is not method`, node);
        }

        const params =  description.constructor ?  description.constructor.params : null;
        const args = node.arguments.map( (item,index)=>{
            const val = this.parser(item,scope,node);
            if( params[index] )
            {
               this.compilation.checkType( params[index], val.type );
            }
            return val;
        });

        return {node,arguments:args,description};
    }

    RestElement(node, scope, parent)
    {
       return {node,description:new Type("Array")};
    }

    SpreadElement(node, scope, parent)
    {
        const argument = this.parser(node.argument,scope,node);
        return {node,argument};
    }

    ReturnStatement(node,scope, parent)
    {
        let argument = this.parser(node.argument,scope,node);
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( argument );
        return {node,argument};
    }

    ExpressionStatement(node,scope, parent)
    {
        const expression = this.parser(node.expression,scope,node);
        return {node,expression};
    }

    UpdateExpression(node,scope, parent)
    { 
        const argument = this.parser(node.argument, scope, node);
        return {node,argument,description:this.compilation.getType("Number")};
    }

    UnaryExpression(node,scope, parent)
    {
        const argument = this.parser(node.argument, scope, node);
        return {node,argument,description:this.compilation.getType("Number")};
    }

    BlockStatement(node,scope,parent)
    {
        if( !(parent && parent.type === "FunctionExpression") )
        {
            scope = new BlockScope( scope );
            scope.node = node;
        }
        node.body.forEach( (item)=>{
           item = this.parser(item,scope,node);
           if( item )
           {
               scope.add( item );
           }
        });
        return scope;
    }

    IfStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        return {node,condition,consequent,alternate};
    }

    WhileStatement(node,scope,parent)
    {
        const condition = this.parser(node.test,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,condition,body};
    }

    DoWhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body =  this.parser(node.body,scope,node);
        return {node,condition,body};
    }

    SwitchStatement(node,scope,parent)
    {
        const condition  = this.parser(node.discriminant,scope,node);
        const cases = node.cases.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return {node,condition,cases};
    }

    SwitchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body = node.consequent.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return {node,condition,body};
    }

    BreakStatement(node,scope,parent)
    {
        return {node};
    }

    ForStatement(node,scope,parent)
    {
        const init = this.parser(node.init,scope,node);
        const condition = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        const body = this.parser(node.body,scope,node); 
        return {node,init,condition,update,body};
    }

    ForInStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,left,right,body};
    }

    ForOfStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,left,right,body};
    }

    TryStatement(node,scope, parent)
    {
        const name = node.handler.param.name;
        const acceptType = this.parser( node.handler.param.acceptType, scope, node);
        const handler    = this.parser( node.handler.body, scope, node);
        const body       = this.parser(node.block, scope, node);
        return {node,handler:{name,acceptType,handler},body};
    }

    WhenStatement(node,scope, parent)
    {
        const name = node.test.callee.name;
        const args = node.test.arguments.map( (item)=>{
            return item.name;
        });

        let consequent = false;
        switch( name ){
            case "Runtime" :
                consequent = this.isRuntime( args[0] );
            break;
        }

        let body = null;
        if( consequent )
        {
            body = node.consequent.body.map( (item)=>{
               return this.parser(item,scope,node.consequent);
            });

        }else if( node.alternate )
        {
            body = node.alternate.body.map( (item)=>{
                return this.parser(item,scope,node.alternate);
            });
        }
        return {node,body};
    }

    ImportSpecifier(node, scope,parent)
    {
        return this.parser(node.expression, scope, node);
    }

    ImportDeclaration(node, scope,parent)
    {
        const specifiers = this.parser(node.specifiers,scope,node);
        this.compilation.module.addDepend( specifiers.split(".").pop(), specifiers );
    }

    VariableDeclaration(node,scope,parent)
    {
        const kind = node.kind;
        const declarations = node.declarations.map( (item)=>{
            return this.parser(item,scope,node);
        });

        switch( parent && parent.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return {node,kind,declarations,flag:true};
        }

        return {node,kind,declarations,flag:false};
    }

    VariableDeclarator(node,scope,parent)
    {
        if( node.id && node.id.type ==="ArrayPattern" )
        {
            const initVlaue = this.parser(node.init,scope,node.id);
            return node.id.elements.map( (item,index)=>{
                const init = item.type === "AssignmentPattern" ? this.parser(item.right, scope, item) : null;
                const id   = item.type === "AssignmentPattern" ? item.left.name : item.name;
                const acceptType =  item.type === "AssignmentPattern" ? this.parser(item.left.acceptType,scope,item) : this.parser(item.acceptType,scope,item); 
                const declar = new Declarator(item, id, parent.kind, initVlaue, acceptType, init);
                scope.define(id, declar);
                return declar;
            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            let initValue = this.parser(node.init, scope, node);
            return node.id.properties.map( (item,index)=>{
                const acceptType = this.parser(item.acceptType,scope, node.id);
                const id = item.key.name;
                const init = this.parser(item.value.right,scope, node.id);
                const declar = new Declarator(item, id, parent.kind, initValue, acceptType, init);
                scope.define(id, declar);
                this.checkProp(initValue,id,item);
                return declar;
            });
        }

        const id = node.id.name;  
        const acceptType = this.parser(node.id.acceptType,scope,node);
        const init       = this.parser(node.init,scope,node);
        const declar     = new Declarator(node, id, parent.kind, init, acceptType);
        scope.define(id, declar);
        return declar;
    }

    checkProp(target,prop,node)
    {
        var ob = target;
        if( target )
        {
            if( target.target )
            {
                target = target.target;

            }else if(target.description )
            {
                target = target.description
            }

            if( target.initValue )
            {
                target = target.initValue
            }

            let obj = target;
            while( obj && obj.target )
            {
                obj =  obj.target;
            }

            if( !obj.hasOwnProperty(prop) )
            {
                 this.error(`${prop} is not defined`,node);
            }
        }
    }

    setAssignment(declar, value )
    {
        if( declar.kind==="var" || declar.kind==="let" )
        {
            declar.assignment = value;
        }else
        {
            this.error(`${declar.key} is not writeable`,declar.node);
        }
    }

    FunctionDeclaration(node,scope,parent)
    {
        const key = node.id.name;
        const fnScope = new FunctionScope(scope, false, false, true);
        fnScope.key = key;
        fnScope.node = node;
        fnScope.define("this",  this.compilation.getType("Object") );
        fnScope.arguments = this.parserFunctionParams(fnScope,node.params);
        fnScope.returnType = this.parser(node.returnType, scope, node);
        fnScope.body = this.parser(node.body,fnScope,node);
        scope.define(key,fnScope);
    }

    EnumDeclaration(node,scope,parent)
    {
        const id = node.name;
        const inherit = this.parser(node.extends,scope,node);
        const properties = {};
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? this.parser(item.right,scope,item) : {node:item,value:lastValue++,description:this.compilation.getType("Object")};
            properties[ key ] = value;
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        const obj = new Enum(node, id, properties, inherit);
        scope.define(id, obj);
        return obj;
    }

    ModifierDeclaration(node,scope,parent)
    {
        return node.value || node.name
    }

    AnnotationDeclaration(node, scope, parent)
    {
        const name = node.name;
        const params = [];
        node.body.forEach((item)=>{
            const name = item.name;
            const value = item.value ? item.value.raw || item.value.name : null;
            params.push({name,value});
        });
        this.annotations.push({name,params});
    }

    MetatypeDeclaration(node, scope, parent)
    {
        const name = node.name;
        const params = [];
        node.body.forEach((item)=>{
            const name = item.name;
            const value = item.value ? item.value.raw || item.value.name : null;
            params.push({name,value});
        });
        this.metatypes.push({name,params});
    }

    ClassDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.id = node.id.name;
        module.isClass = true;
        module.extends = node.superClass ? this.parser(node.superClass, scope, node).description : null;
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item,scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        const classScope = new ClassScope( scope, !!node.static );
        classScope.node = node;
        const parseStruct = (flag)=>{
            return node.body.body.forEach( (item)=>{
                if( flag || item.type==="MethodDefinition")
                {
                   this.parser(item,classScope,node,flag);
                }
            });
        }
        parseStruct(true);
        parseStruct(false);
    }

    InterfaceDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.isInterface = true;
        module.id = this.parser(node.id, scope, node);
        module.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        scope = new ClassScope(scope);
        scope.node = node;
        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node,true);
        });
    }

    DeclaratorDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.id = node.id.name;
        module.isDeclarator = true;
        module.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        scope = new ClassScope(scope);
        scope.node = node;
        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node,true);
        });
    }

    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.MemberExpression(node.id,scope,node,false) : null;
        this.module.namespace = Namespace.create( id ? id.member.join(".") : null );
        node.body.forEach( (item)=>{
            this.parser(item, scope, parent);
        });
    }

    TypeDefinition(node,scope, parent)
    {
       return this.parser(node.value,scope,node);
    }

    PropertyDefinition(node,scope, parent)
    {
        const modifier = this.parser(node.modifier, scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        const desc = new PropertyDescription(declar.key,declar.kind,declar.acceptType,!!node.static,modifier);
        desc.node = node;
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.compilation.module.addMember(desc.key, desc);
        scope.add( desc );
    }

    MethodDefinition(node,scope, parent, flag)
    {
       const key = node.key.name ;
       const isStatic = !!node.static;
       const module = this.compilation.module;
       if( flag === true )
       {
            const kind = node.kind;
            const modifier = this.parser(node.modifier,scope, node);
            const metatypes = this.metatypes.splice(0,this.metatypes.length);
            const annotations = this.annotations.splice(0,this.annotations.length);
            const params = this.parserFunctionParams( scope, node.value.params );
            const isConstruct = kind ==="constructor" || key==="constructor" || module.id === key;
            const returnType = isConstruct ? module : this.parser(node.returnType, scope, node);
            const desc = new MethodDescription(key,kind,returnType,isStatic,modifier,params);
            desc.node = node;
            desc.metatypes = metatypes;
            desc.annotations = annotations;
            if( isConstruct )
            {
                module.constructor = desc;
            }else{
                module.addMember(key, desc);
            }

       }else
       {
            let desc = this.compilation.getDescribe( key, isStatic );
            desc.body = this.parser(node.value, scope, node);
            scope.add( desc );
       }
    }

    Program(node, scope, parent)
    {
        node.body.forEach( (item)=>{
            this.parser( item, scope, parent );
        });
    }

    Identifier(node, scope, parent)
    {
        const value = node.name;
        const description = scope.define( value ) || this.compilation.getType( value );
        if( !description )
        {
            this.error(`"${value}" is not defined`, node);
        }
        return {node,value,description};
    }

    Literal(node,scope,parent)
    {
        let type = "String";
        const value = node.raw || node.value;
        if( node.regex )
        {
            type= "RegExp";

        }else if(node.value == node.raw)
        {
            type= "Number";
        }else if( node.raw === "false" || node.raw === "true")
        {
            type = "Boolean";
        }
        const description = this.compilation.getType( type );
        return {node,value,description};
    }

    parser(node,scope,parent=null,flag=void 0)
    {
        if( !node )
        {
            return null;
        }
        return this[ node.type ](node,scope,parent,flag);
    }
}

module.exports = Grammar;