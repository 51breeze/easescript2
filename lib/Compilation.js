const fs     = require("fs");
const events = require('events');
const TopScope = require("./scope/TopScope.js");
const Parser = require("./Parser.js");
const Namespace = require("./Namespace.js");
const Module = require("./Module.js");
const Type = require("./Type.js");
const TupleType = require("./TupleType.js");
const UnionType  = require("./UnionType.js");
const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Enum  = require("./Enum.js");



class Compilation extends events.EventEmitter 
{
    constructor( compiler, module )
    {
       super(); 
       this.compiler = compiler;
       this.module   = module;
       this.grammar  = new Map();
       this.children = [];
       this.syntaxs  = [];
       this.annotations = [];
       this.metatypes   = [];
       this.scope=new TopScope( null );
       this.stack=null;
    }

    error(message, node, expre="")
    {
        if( node )
        {
            message+= ` (${this.module.file}:`+ this.getLinePosBy( node.end, expre || node.name || node.raw )+")";
        }
        
        throw new ReferenceError( message );
    }

    isRuntime()
    {
        return true;
    }

    MemberExpression(node,scope,parent,declar=false)
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
            base = this.getReference(name, base, isStatic);
            if( !base )
            {
                this.error( `"${member.map(item=>item.name).join(".")}" is not defined.`, node );
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
                let desc = null;
                switch( node.object.type ){
                    case "ThisExpression" :
                        desc = this.ThisExpression(node.object,scope,node);
                        member.push( desc );
                        base = desc.description;
                    break;
                    case "CallExpression" :
                        desc = this.CallExpression(node.object,scope,node);
                        member.push( desc );
                        base = desc.description;
                    break;
                    default :
                        member.push( node.object );
                        if( !declar )
                        {
                             base = check(node.object.name, base);
                        }
                }
               
                if( member.length===1 && base instanceof Module && base.id == member[0].name )
                {
                    isStatic = true;
                }

                chain.push( base );
            }
            member.push( node.property );

           
            if( !declar )
            {
                base = check(name,base);
                chain.push( base );
            }
            return member;
        }

        memberExpression( node );
        return {node,parent,scope,member,chain,description:base};
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
        const description = this.getType("Object");
        return {node,parent,scope,properties,target,description};
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
            let defaultValue = null;
            let declar = null;
            if( item.type === "AssignmentPattern" )
            {
                name = item.left.name;
                type = this.parser(item.left.acceptType,scope,item);
                defaultValue = this.parser(item.right,scope,item);
                declar = new Parameter(item, name, defaultValue, type);
                declar.assignment = defaultValue;
                
            }else
            {
                name = item.name;
                type = this.parser(item.acceptType,scope,parent);
                if( item.type === "RestElement" )
                {
                    name = item.argument.name;
                }
                declar = new Parameter(item, name, defaultValue, type, item.type === "RestElement");
            }
            declar.parent = parent;
            params.push( declar );
            scope.define(name, declar);
        });
        return params;
    }

    FunctionExpression(node,scope,parent,isArrow,isExpression)
    {
        const isMethod = parent && parent.type ==="MethodDefinition";
        const fnScope = isMethod ? scope : new FunctionScope( scope, !!isExpression , !!isArrow );
        const returnType = this.parser(node.returnType,scope,node);
        const params = this.parserFunctionParams(scope,node.params);
        const body = this.parser(node.body,fnScope,node);
        fnScope.returnType = returnType
        fnScope.arguments  = params;
        return {node,parent,scope:fnScope,returnType,params,body};
    }

    ArrayExpression(node,scope, parent)
    {
        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        const description = this.getType("Array");
        return {node,parent,scope,elements,description};
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        const operator =  node.operator;
        const description = new UnionType(left.description,right.description);
        return {node,parent,scope,left,right,operator,description};
    }

    AssignmentExpression(node, scope, parent)
    {
        const left = this.parser( node.left, scope, node );
        const right = this.parser( node.right, scope, node);
        const declar = left.description;
        if( !(declar instanceof Declarator) )
        {
            this.error( `"${left.value}" is not defined.`, node);
        }
        declar.assignment = right;
        return {node,parent,scope,left,right};
    }

    ThisExpression(node, scope, parent)
    {
        let fnScope = scope.getScopeByType("function");
        const description = fnScope.define( "this" );
        if( !description )
        {
            this.error( `"this" is not exist.`, node);
        }
        return {node,parent,scope,description,name:"this"};
    }

    BinaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const right = this.parser(node.right,scope,node);
         const operator = node.operator;
         return {node,parent,scope,left,right,operator};
    }

    CallExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const description = callee.description instanceof Module ? callee.description.callable : callee.description;
        if( !description || !(description.kind ==="method" || description instanceof FunctionScope) )
        {
            const props = callee.member ? callee.member.map( item=>item.name ).join(".") : callee.value;
            this.error(`"${props}" is not callable`, node);
        }        

        const args = node.arguments.map( (item,index)=>{
           const val = this.parser(item,scope,node);
           if( description.params[index] )
           {
              if( description.params[index].acceptType && !this.checkType(description.params[index].acceptType.description, val.description ) )
              {
                 const props = callee.member ? callee.member.map( item=>item.name ).join(".") : callee.value;
                 this.error(`"${props}" params type is not match`, node, props);
              }
           }
           return val;
        });
        
        const check = description.params.every( (item,index)=>{
            return !!(item.initValue===null ? args[index] : true);
        });

        if( !check )
        {
            const props = callee.member ? callee.member.map( item=>item.name ).join(".") : callee.value;
            this.error(`"${props}" missing arguments`, node, props);
        }

        var expreType = description.returnType;
        if( !expreType )
        {
            console.log(  description.scope.returnItems )
            expreType = new UnionType( description.scope.returnItems.map( item=>{
                if( item.description instanceof Declarator )
                {
                    return item.description.acceptType;
                }
                return item.description;
            }));
        }
        return {node,parent,scope,callee,arguments:args,callable:description,description:expreType};
    }

    NewExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const description = callee.description;
       
        if( !(description instanceof Module) )
        {
            const props = callee.member ? callee.member.join(".") : callee.value;
            this.error(`"${props}" is not method`, node);
        }

        const params =  description.constructor ?  description.constructor.params : null;
        const args = node.arguments.map( (item,index)=>{
            const val = this.parser(item,scope,node);
            if( params && params[index] )
            {
               this.checkType( params[index], val.type );
            }
            return val;
        });

        return {node,parent,scope,arguments:args,callee,description};
    }

    SpreadElement(node, scope, parent)
    {
        const argument = this.parser(node.argument,scope,node);
        return {node,parent,scope,argument,isSpreadElement:true};
    }

    ReturnStatement(node,scope, parent)
    {
        let argument = this.parser(node.argument,scope,node);
        const fnScope = scope.getScopeByType("function");
        console.log(  fnScope.key  )
        fnScope.returnItems.push( argument );
        return {node,parent,scope,argument};
    }

    ExpressionStatement(node,scope, parent)
    {
        const expression = this.parser(node.expression,scope,node);
        return {node,parent,scope,expression};
    }

    UpdateExpression(node,scope, parent)
    { 
        const argument = this.parser(node.argument, scope, node);
        const operator = node.operator;
        const prefix   = node.prefix;
        return {node,parent,scope,argument,operator,prefix,description:this.getType("Number")};
    }

    UnaryExpression(node,scope, parent)
    {
        const argument = this.parser(node.argument, scope, node);
        return {node,parent,scope,argument,description:this.getType("Number")};
    }

    BlockStatement(node,scope,parent)
    {
        if( !(parent && (parent.type === "FunctionExpression" || parent.type === "ArrowFunctionExpression" || parent.type === "FunctionDeclaration") ) )
        {
            scope = new BlockScope( scope );
            scope.node = node;
        }
        const body = node.body.map( (item)=>{
           return this.parser(item,scope,node);
        }).filter( item=>!!item );
        return {node,parent,scope,body};
    }

    IfStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        return {node,parent,scope,condition,consequent,alternate};
    }

    WhileStatement(node,scope,parent)
    {
        const condition = this.parser(node.test,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,parent,scope,condition,body};
    }

    DoWhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body =  this.parser(node.body,scope,node);
        return {node,parent,scope,condition,body};
    }

    SwitchStatement(node,scope,parent)
    {
        const condition  = this.parser(node.discriminant,scope,node);
        const cases = node.cases.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return {node,parent,scope,condition,cases};
    }

    SwitchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        scope = new BlockScope(scope);
        const body = node.consequent.map( (item)=>{
            return this.parser(item,new BlockScope(scope),node);
        });
        return {node,parent,scope,condition,body};
    }

    BreakStatement(node,scope,parent)
    {
        return {node,parent,scope};
    }

    ForStatement(node,scope,parent)
    {
        const init = this.parser(node.init,scope,node);
        const condition = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        const body = this.parser(node.body,scope,node); 
        return {node,parent,scope,init,condition,update,body};
    }

    ForInStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,parent,scope,left,right,body};
    }

    ForOfStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,parent,scope,left,right,body};
    }

    TryStatement(node,scope, parent)
    {
        const name = node.handler.param.name;
        const acceptType = this.parser( node.handler.param.acceptType, scope, node);
        const handler    = this.parser( node.handler.body, scope, node);
        const body       = this.parser(node.block, scope, node);
        return {node,parent,scope,handler:{name,acceptType,body:handler},body};
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
        return {node,parent,scope,body};
    }

    ImportSpecifier(node, scope,parent)
    {
        return this.parser(node.expression, scope, node);
    }

    ImportDeclaration(node, scope,parent)
    {
        const specifiers = this.parser(node.specifiers,scope,node);
        this.module.addDepend( specifiers.split(".").pop(), specifiers );
    }

    VariableDeclaration(node,scope,parent)
    {
        const kind = node.kind;
        let declarations = [];
        node.declarations.forEach( (item)=>{
            declarations = declarations.concat( this.parser(item,scope,node) );
        });

        switch( parent && parent.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return {node,parent,scope,kind,declarations,flag:true};
        }

        return {node,parent,scope,kind,declarations,flag:false};
    }

    VariableDeclarator(node,scope,parent)
    {
        const check = (target,prop)=>{

            if( target instanceof Declarator )
            {
                return check(target.initValue,prop);
            }

            if( target.node.type==="ObjectExpression" )
            {
                return target.target.hasOwnProperty(prop);

            }else if( target.node.type==="ArrayExpression" )
            {
                return target.elements.hasOwnProperty(prop);
            }
            return false;
        };

        const expression = ( target )=>{
            if( target.description instanceof Declarator )
            {
                return expression( target.description.initValue );
            }
            return target;
        }

        if( node.id && node.id.type ==="ArrayPattern" )
        {
            const initValue = this.parser(node.init,scope,node.id);
            const initType  = node.init.type;
            return node.id.elements.map( (item,index)=>{
                const init = item.type === "AssignmentPattern" ? this.parser(item.right, scope, item) : null;
                const id   = item.type === "AssignmentPattern" ? item.left.name : item.name;
                const acceptType =  item.type === "AssignmentPattern" ? this.parser(item.left.acceptType,scope,item) : this.parser(item.acceptType,scope,item); 
                const declar = new Declarator(item, id, parent.kind, initValue, acceptType, init);
                if( initType ==="ObjectExpression" )
                {  
                    declar.initValue = null;

                }else if( initType ==="ArrayExpression" )
                {
                    declar.initValue = initValue.elements[ index ];
                }else{
                    declar.propName = index;
                }
                declar.isArrayPattern = true;
                declar.parent = parent;
                scope.define(id, declar);
                return declar;
            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            const initValue = this.parser(node.init, scope, node);
            const initType  = node.init.type;
            return node.id.properties.map( (item,index)=>{
                const acceptType = this.parser(item.acceptType,scope, node.id);
                const id = item.key.name;
                const init = this.parser(item.value.right,scope, node.id);
                const declar = new Declarator(item, id, parent.kind, initValue, acceptType, init);
                if( initType ==="ObjectExpression" )
                {
                    if( !check(initValue,id) )
                    {
                        this.error(`"${id}" is not defined.`, item, id);
                    }
                    declar.initValue = initValue.target[ id ];
                    declar.assignment = expression( initValue.target[ id ] );

                }else if( initType ==="ArrayExpression" )
                {
                    declar.initValue = null;
                }else{
                    declar.propName = id;
                }
                declar.isObjectPattern = true;
                declar.parent = parent;
                scope.define(id, declar);
                return declar;
            });
        }

        const id = node.id.name;  
        const acceptType = this.parser(node.id.acceptType,scope,node);
        const init       = this.parser(node.init,scope,node);
        const declar     = new Declarator(node, id, parent.kind, init, acceptType);
        if( init )
        {
            declar.assignment = expression( init );
        }
        declar.parent = parent;
        scope.define(id, declar);
        return declar;
    }

    FunctionDeclaration(node,scope,parent)
    {
        const key = node.id.name;
        const fnScope = new FunctionScope(scope);
        fnScope.define("this",  this.getType("Object") );
        const params =  this.parserFunctionParams(fnScope,node.params);
        const returnType = this.parser(node.returnType, scope, node);
        const body =  this.parser(node.body,fnScope,node);
        fnScope.key = key;
        fnScope.arguments = params;
        fnScope.returnType = returnType;
        scope.define(key,fnScope);
        return {node,parent,scope:fnScope,key,params,returnType,body};
    }

    EnumDeclaration(node,scope,parent)
    {
        const id = node.name;
        const inherit = this.parser(node.extends,scope,node);
        const properties = [];
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? this.parser(item.right,scope,item) : {node:item,value:lastValue++,description:this.getType("Object")};
            value.key = key;
            properties.push( value );
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        const obj = new Enum(node, id, properties, inherit);
        obj.scope = scope;
        obj.parent = parent;
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
        const module = this.module;
        module.id = node.id.name;
        module.isClass = true;
        module.extends = node.superClass ? this.parser(node.superClass, scope, node) : null;
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item,scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.publish();
        const classScope = new ClassScope( scope, !!node.static );
        const body = node.body.body.map( (item)=>{
            return this.parser(item,classScope,node);
        });
        module.making = true;
        node.body.body.forEach( (item)=>{
            if( item.type==="MethodDefinition")
            {
               this.parser(item,classScope,node);
            }
        });
        return {node,parent,scope,body:body.filter(item=>!!item)};
    }

    InterfaceDeclaration(node, scope, parent)
    {
        const module = this.module;
        module.isInterface = true;
        module.id = this.parser(node.id, scope, node);
        module.extends = this.parser(node.extends, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.publish();
        const classScope = new ClassScope(scope);
        const body = node.body.body.map( (item)=>{
            return this.parser(item,classScope,node,true);
        });
        return {node,parent,scope,body};
    }

    DeclaratorDeclaration(node, scope, parent)
    {
        const module = this.module;
        module.id = node.id.name;
        module.isDeclarator = true;
        module.extends = this.parser(node.extends, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.publish();
        const classScope = new ClassScope(scope);
        const body = node.body.body.map( (item)=>{
            return this.parser(item,classScope,node,true);
        });
        return {node,parent,scope,body};
    }

    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.MemberExpression(node.id,scope,node,true) : null;
        this.module.namespace = Namespace.create( id ? id.member.map( item=>item.name ).join(".") : null );
        const body = node.body.map( (item)=>{
            return this.parser(item, scope, parent);
        });
        return {node,parent,scope,body};
    }

    TypeDefinition(node,scope, parent)
    {
        const type = this.parser(node.value,scope,node);
        const typeElements = node.value.typeElements && node.value.typeElements.map( item=>{
           return this.parser(item,scope,node)
        });

        if( node.isArrayElement )
        {
            const tupleType = {node:type.node,parent,scope,value:type.value};
            tupleType.description = new TupleType( typeElements || [type] );
            return tupleType;
        }
      
       if( type.description instanceof Type )
       {
           return type;
       }
       if( node.value.type ==="Identifier" ){
          this.error("Type invalid", node, node.value.name);
       }else if(type.member){
          this.error("Type invalid", node, type.member.map( item=>item.name).join(".") ); 
       }
       this.error("Type invalid", node);
    }

    PropertyDefinition(node,scope, parent)
    {
        const modifier = this.parser(node.modifier, scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        const desc = new PropertyDescription(declar,!!node.static,modifier);
        desc.node = node;
        desc.parent = parent;
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.module.addMember(desc.key, desc);
        return desc; 
    }

    MethodDefinition(node,scope, parent)
    {
       const key      = node.key.name;
       const isStatic = !!node.static;
       const module   = this.module;
       if( module.making === false )
       {
            scope = new FunctionScope(scope);
            const kind = node.kind;
            const modifier = this.parser(node.modifier,scope, node);
            const metatypes = this.metatypes.splice(0,this.metatypes.length);
            const annotations = this.annotations.splice(0,this.annotations.length);
            const params = this.parserFunctionParams( scope, node.value.params );
            const isConstruct = kind ==="constructor";
            const returnType = isConstruct ? module : this.parser(node.value.returnType, scope, node);
            const description = new MethodDescription(key,kind,returnType,isStatic,modifier,params);
            description.node  = node;
            description.scope = scope;
            description.parent = parent;
            description.metatypes = metatypes;
            description.annotations = annotations;
            scope.key = key;
            if( isConstruct )
            {
                scope.key = "constructor";
                module.constructor = description;
            }else if( key ==="Callable" ){
                module.callable = description;
            }else{
                module.addMember(key, description);
            }

            if( !isStatic )
            {
                scope.define("this",module);
            }
            return description;

       }else 
       {
            const description = this.getDescribe( key, isStatic );
            description.value = this.parser(node.value, description.scope, node);
       }
    }

    Program(node, scope, parent)
    {
        const body = node.body.map( (item)=>{
            return this.parser( item, scope, parent );
        });
        return {node,parent,scope,body};
    }

    Identifier(node, scope, parent)
    {
        const value = node.name;
        const description = scope.define( value ) || this.getType( value , true);
        if( !description )
        {
            this.error(`"${value}" is not defined`, node, value);
        }
        return {node,parent,value,description};
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

        }else if( value === "null"){
            type = "Nullable";
        }
        const description = type ==="Nullable" ? new Type("Nullable", ["Object"]) : this.getType( type );
        return {node,scope,parent,value,description};
    }

    parser(node,scope,parent=null)
    {
        if( !node )
        {
            return null;
        }

        switch( node.type ){
            case "Program":
                return this.Program(node,scope,parent);
            case "Literal" :
                return this.Literal(node,scope,parent);
            case "Identifier":
                return this.Identifier(node,scope,parent);
            case "MethodDefinition":
                return this.MethodDefinition(node,scope,parent);
            case "PropertyDefinition":
                return this.PropertyDefinition(node,scope,parent);
            case "TypeDefinition":
                return this.TypeDefinition(node,scope,parent);
            case "PackageDeclaration":
                return this.PackageDeclaration(node,scope,parent);
            case "DeclaratorDeclaration":
                return this.DeclaratorDeclaration(node,scope,parent);
            case "ClassDeclaration":
                return this.ClassDeclaration(node,scope,parent);
            case "InterfaceDeclaration":
                return this.InterfaceDeclaration(node,scope,parent);
            case "EnumDeclaration":
                return this.EnumDeclaration(node,scope,parent);
            case "FunctionDeclaration":
                return this.FunctionDeclaration(node,scope,parent);
            case "VariableDeclaration":
                return this.VariableDeclaration(node,scope,parent);
            case "VariableDeclarator":
                return this.VariableDeclarator(node,scope,parent);
            case "ModifierDeclaration":
                return this.ModifierDeclaration(node,scope,parent);
            case "AnnotationDeclaration":
                return this.AnnotationDeclaration(node,scope,parent);
            case "MetatypeDeclaration":
                return this.MetatypeDeclaration(node,scope,parent);
            case "RestElement":
                return this.RestElement(node,scope,parent);
            case "SpreadElement":
                return this.SpreadElement(node,scope,parent);
            case "ReturnStatement":
                return this.ReturnStatement(node,scope,parent);
            case "ExpressionStatement":
                return this.ExpressionStatement(node,scope,parent);
            case "BlockStatement":
                return this.BlockStatement(node,scope,parent);
            case "IfStatement":
                return this.IfStatement(node,scope,parent);
            case "WhileStatement":
                return this.WhileStatement(node,scope,parent);
            case "DoWhileStatement":
                return this.DoWhileStatement(node,scope,parent);
            case "SwitchStatement":
                return this.SwitchStatement(node,scope,parent);
            case "SwitchCase":
                return this.SwitchCase(node,scope,parent);
            case "BreakStatement":
                return this.BreakStatement(node,scope,parent);
            case "ForStatement":
                return this.ForStatement(node,scope,parent);
            case "ForInStatement":
                return this.ForInStatement(node,scope,parent);
            case "ForOfStatement":
                return this.ForOfStatement(node,scope,parent);
            case "TryStatement":
                return this.TryStatement(node,scope,parent);
            case "WhenStatement":
                return this.WhenStatement(node,scope,parent);
            case "MemberExpression":
                return this.MemberExpression(node,scope,parent);
            case "ObjectExpression":
                return this.ObjectExpression(node,scope,parent);
            case "ArrowFunctionExpression":
                return this.ArrowFunctionExpression(node,scope,parent);
            case "FunctionExpression":
                return this.FunctionExpression(node,scope,parent);
            case "ArrayExpression":
                return this.ArrayExpression(node,scope,parent);
            case "LogicalExpression":
                return this.LogicalExpression(node,scope,parent);
            case "AssignmentExpression":
                return this.AssignmentExpression(node,scope,parent);
            case "ThisExpression":
                return this.ThisExpression(node,scope,parent);
            case "BinaryExpression":
                return this.BinaryExpression(node,scope,parent);
            case "CallExpression":
                return this.CallExpression(node,scope,parent);
            case "NewExpression":
                return this.NewExpression(node,scope,parent);
            case "UpdateExpression":
                return this.UpdateExpression(node,scope,parent);
            case "UnaryExpression":
                return this.UnaryExpression(node,scope,parent);
        }
        this.error("Invalid token", node);
    }

    getDescribe( key, isStatic )
    {
        const module = this.module;
        if( isStatic )
        {
            return module.getMethod( key );
        }
        return module.getMember( key );
    }

    getReference(key,target,isStatic)
    {
        if( target )
        {
            if( target instanceof Module )
            {
                if( isStatic )
                {
                    return target.getMethod( key );
                }
                return target.getMember( key );
            }

            if( target instanceof Type )
            {
                if( target.target )
                {
                    target = target.target;
                }else {
                    target = this.getType( target.name );
                }
            }
        }
        return target ? Namespace.fetch( key, target ) : this.getType( key );
    }

    getType(id)
    {
        const type = this.module.namespace.get( id ) || this.module.getDepend(id) || Namespace.fetch( id );
        if( !type )
        {
            const file = this.compiler.getFileAbsolute( id);
            if( !fs.existsSync( file ) )
            {
               return false;
            }
            const module = this.compiler.createModule( file );
            if( !module.ast )
            {
                const compilation = new Compilation( this.compiler, module );
                this.children.push( compilation );
                compilation.build( this.syntaxs );
            }
            return module;
        }
        return type;
    }

    checkType(acceptType, assignmentType )
    {
        if( acceptType instanceof Type && assignmentType instanceof Type )
        {
            return acceptType.is( assignmentType );
        }
        return false;
    }

    getLinePosBy(pos, raw)
    {
        const lines=this.module.source.substr(0,pos+1).split(/\r\n/);
        let column = raw ? lines[lines.length-1].indexOf(raw) : 0;
        return lines.length+":"+column;
    }

    createGrammar( syntax )
    {
        if( !this.grammar.has(syntax) )
        {
            const grammar = this.compiler.getGrammar( syntax );
            this.grammar.set(syntax, new grammar(this) );
        }
        return this.grammar.get(syntax);
    }

    createAst()
    {
        const module = this.module;
        if( !module.ast )
        {
            try{
               module.source = fs.readFileSync(module.file).toString();
               module.ast = Parser.Parser.parse(module.source,{});
            }catch(e){
                console.log(e);
                throw new Error( `${e.message} \r\n at ${module.file}`)
            }
        }
        return module.ast;
    }


    build( syntaxs )
    { 
        this.syntaxs = syntaxs;
        const ast   = this.createAst();
        const scope = this.scope;
        let stack   = this.stack;
        if( !stack )
        {
            stack = this.parser(ast, scope);
        }

        syntaxs.forEach((syntax)=>{
            if( this.module.isClass )
            {
                const grammar = this.createGrammar( syntax );
                grammar.build( stack );
            }
        });
    }
}


module.exports = Compilation;
