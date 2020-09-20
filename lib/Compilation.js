const TopScope = require("./scope/TopScope.js");
const DeclaratorScope = require("./scope/DeclaratorScope.js");
const InterfaceScope = require("./scope/InterfaceScope.js");
const Parser = require("./Parser");
const fs     = require("fs");
const Namespace = require("./Namespace");
const Module = require("./Module");
const Type = require("./Type.js");
const events = require('events');

const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Enum  = require("./Enum.js");
const Union  = require("./Union.js");
const Stack = require("./Stack.js");


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
       this.stack       = new TopScope( this );
    }

    error(message, node, expre="")
    {
        if( node )
        {
            message+=" ("+ this.getLinePosBy( node.end, expre || node.name || node.raw )+")";
        }
        throw new ReferenceError( message );
    }

    isRuntime()
    {
        return true;
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
                if( node.object.type ==="ThisExpression" )
                {
                   const desc = this.ThisExpression(node.object,scope,node);
                   member.push( desc );
                   base = desc.description;

                }else
                { 
                    member.push( node.object );
                    if( flag !== false )
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
        const description = this.getType("Object");
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
                const isRest = item.type === "RestElement" ;
                name = isRest ? item.argument.name : item.name;
                type = this.parser(item.acceptType,scope,parent);
                declar = new Parameter(item, name, defaultValue, type, isRest);
            }
            params.push( declar );
            scope.define(name, declar);
        });
        return params;
    }

    FunctionExpression(node,scope,parent,isArrow,isExpression)
    {
        const fnScope = new FunctionScope( scope, !!node.static , !!isArrow );
        let key = null;
        let isMethod = parent.type ==="MethodDefinition";
        if( parent && isMethod )
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
        fnScope.node = node;
        if( !isMethod )
        {
            fnScope.key = key;
            fnScope.isExpression = !!isExpression;
            fnScope.returnType = this.parser(node.returnType,scope,node);
            fnScope.params  = this.parserFunctionParams(scope,node.params);
        }
        this.parser(node.body,fnScope,node);
        return fnScope;
    }

    ArrayExpression(node,scope, parent)
    {
        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        const description = this.getType("Array");
        return {node,elements,description};
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        const operator =  node.operator;
        const description = new Union(left.description,right.description);
        return {node,left,right,operator,description};
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
        return {node,description,name:"this"};
    }

    BinaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const right = this.parser(node.right,scope,node);
         const operator = node.operator;
         return {node,left,right,operator};
    }

    CallExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const description = callee.description;
        const args = node.arguments.map( (item,index)=>{
           const val = this.parser(item,scope,node);
           if( description.params[index] )
           {
              this.checkType( description.params[index], val.type );
           }
           return val;
        });

        if( !description || !(description.kind ==="method" || description instanceof FunctionScope) )
        {
            this.error(`"${target}" is not method`, node);
        }        
        return {node,callee,arguments:args,description};
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
               this.checkType( params[index], val.type );
            }
            return val;
        });

        return {node,arguments:args,callee,description};
    }

    RestElement(node, scope, parent)
    {
       return {node,description:new Type("Array")};
    }

    SpreadElement(node, scope, parent)
    {
        const argument = this.parser(node.argument,scope,node);
        return {node,argument,isSpreadElement:true};
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
        const operator = node.operator;
        const prefix   = node.prefix;
        return {node,argument,operator,prefix,description:this.getType("Number")};
    }

    UnaryExpression(node,scope, parent)
    {
        const argument = this.parser(node.argument, scope, node);
        return {node,argument,description:this.getType("Number")};
    }

    BlockStatement(node,scope,parent)
    {
        node.body.forEach( (item)=>{
           const expre = this.parser(item,scope,node);
           if( expre )
           {
               scope.add( expre );
           }
        });
        return scope;
    }

    IfStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,new BlockScope(scope),node);
        const alternate  = node.alternate ? this.parser(node.alternate,new BlockScope(scope),node) : null;
        return {node,condition,consequent,alternate};
    }

    WhileStatement(node,scope,parent)
    {
        const condition = this.parser(node.test,scope,node);
        const body = this.parser(node.body,new BlockScope(scope),node);
        return {node,condition,body};
    }

    DoWhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body = this.parser(node.body,new BlockScope(scope),node);
        return {node,condition,body};
    }

    SwitchStatement(node,scope,parent)
    {
        const condition  = this.parser(node.discriminant,scope,node);
        const blockScope = new BlockScope(scope);
        node.cases.forEach( (item)=>{
            blockScope.add( this.parser(item,blockScope,node) );
        });
        return {node,condition,cases:blockScope};
    }

    SwitchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const blockScope = new BlockScope( scope );
        blockScope.node = node;
        blockScope.condition = condition;
        node.consequent.map( (item)=>{
            const expre = this.parser(item,blockScope,node);
            if( expre )
            {
                blockScope.add( expre );
            }
        });
        return {node,condition,consequent:blockScope};
    }

    BreakStatement(node,scope,parent)
    {
        return {node};
    }

    ForStatement(node,scope,parent)
    {
        const blockScope = new BlockScope( scope );
        const init = this.parser(node.init,blockScope,node);
        const condition = this.parser(node.test,blockScope,node);
        const update = this.parser(node.update,blockScope,node);
        const body = this.parser(node.body,blockScope,node);
        return {node,init,condition,update,body};
    }

    ForInStatement(node,scope,parent)
    {
        const blockScope = new BlockScope( scope );
        const left = this.parser(node.left,blockScope,node);
        const right = this.parser(node.right,blockScope,node);
        const body = this.parser(node.body,blockScope,node);
        return {node,left,right,body};
    }

    ForOfStatement(node,scope,parent)
    {
        const blockScope = new BlockScope( scope );
        const left = this.parser(node.left,blockScope,node);
        const right= this.parser(node.right,blockScope,node);
        const body= this.parser(node.body,blockScope,node);
        return {node,left,right,body};
    }

    TryStatement(node,scope, parent)
    {
        const name        = node.handler.param.name;
        const acceptType  = this.parser( node.handler.param.acceptType, scope, node);
        const handler     = this.parser(node.handler.body, new BlockScope(scope), node);
        const body        = this.parser(node.block, new BlockScope(scope), node);
        return {node,handler:{name,acceptType,body:handler},body};
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

        let body = [];
        if( consequent )
        {
            body = node.consequent.body;

        }else if( node.alternate )
        {
            body = node.alternate.body;
        }

        body.forEach( (item)=>{
            const expre = this.parser(item,scope,node);
            if( expre )
            {
                scope.add( expre );
            }
        });
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
        const params = this.parserFunctionParams(scope,node.params,node);
        const returnType = this.parser(node.returnType, scope, node);
        fnScope.key = key;
        fnScope.node = node;
        fnScope.returnType = returnType;
        fnScope.params = params;
        fnScope.define("this",  this.getType("Object") );
        scope.define(key,fnScope);
        this.parser(node.body,fnScope,node);
        return {node,key,params,returnType,body:fnScope};
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
        module.extends = node.superClass ? this.parser(node.superClass, scope, node).description : null;
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item,scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        const classScope = new ClassScope( scope, !!node.static );
        const parseStruct = (flag)=>{
            node.body.body.forEach( (item)=>{
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
        const module = this.module;
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
        scope = new InterfaceScope(scope);
        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node,true);
        });
    }

    DeclaratorDeclaration(node, scope, parent)
    {
        const module = this.module;
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
        scope = new DeclaratorScope(scope);
        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node,true);
        });
    }

    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.MemberExpression(node.id,scope,node,false) : null;
        this.module.namespace = Namespace.create( id ? id.member.map( item=>item.name ).join(".") : null );
        node.body.forEach( (item)=>{
            this.parser(item, scope, parent);
        });
    }

    TypeDefinition(node,scope, parent)
    {
       const type = this.parser(node.value,scope,node);
       if( type.description instanceof Module || type.description instanceof Type ){
           return type;
       }
       this.error("Type invalid", node);
    }

    PropertyDefinition(node,scope, parent)
    {
        const modifier = this.parser(node.modifier, scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        const desc = new PropertyDescription(declar,!!node.static,modifier);
        desc.node = node;
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.module.addMember(desc.key, desc);
        scope.add( desc );
    }

    MethodDefinition(node,scope, parent, flag)
    {
       const key = node.key.name ;
       const isStatic = !!node.static;
       const module = this.module;
       if( flag === true )
       {
            const kind = node.kind;
            const modifier = this.parser(node.modifier,scope, node);
            const metatypes = this.metatypes.splice(0,this.metatypes.length);
            const annotations = this.annotations.splice(0,this.annotations.length);
            const params = this.parserFunctionParams( scope, node.value.params, node );
            const isConstruct = kind ==="constructor" || key==="constructor" || module.id === key;
            const returnType = isConstruct ? module : this.parser(node.value.returnType, scope, node);
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
            return desc;

       }else
       {
            let desc = this.getDescribe( key, isStatic );
            desc.value = this.parser(node.value, scope, node);
            desc.value.returnType = desc.returnType;
            desc.value.params = desc.params;
            desc.value.MethodDescription = desc;
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
        const description = scope.define( value ) || this.getType( value , true);
        if( !description )
        {
            this.error(`"${value}" is not defined`, node, value);
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
        const description = this.getType( type );
        return {node,value,description};
    }

    parser(node,scope,parent=null,flag=null)
    {
        if( !node )
        {
            return null;
        }
        return this[ node.type ](node,scope,parent,flag);
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
            if( target instanceof Type )
            {
                if( target.target )
                {
                    target = target.target;
                }else {
                    target = this.getType( target.name );
                }
            }

            if( target instanceof Module )
            {
                if( isStatic )
                {
                    return target.getMethod( key );
                }
                return target.getMember( key );
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

    checkType(acceptType, expreType )
    {
        if( acceptType instanceof Type )
        {
            return acceptType.of( expreType );
        }

        if(  acceptType instanceof Module )
        {
            
        }

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
        const ast   = this.createAst();
        this.syntaxs = syntaxs;
        this.parser(ast, this.stack);

        syntaxs.forEach((syntax)=>{
            if( this.module.isClass )
            {
                const grammar = this.createGrammar( syntax );
                grammar.build();
            }
        });       
        
    }
}


module.exports = Compilation;
