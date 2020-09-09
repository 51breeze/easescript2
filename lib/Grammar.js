const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Namespace  = require("./Namespace.js");
const Type  = require("./Type.js");
const Expression  = require("./Expression.js");
const Enum  = require("./Enum.js");
const Declaration  = require("./Declaration.js");
const Intersection  = require("./Intersection.js");
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
       this.hasStruct = false;
       this.expressionReference=[];
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
                let target = node.object.name;
                member.push( target );
                if( flag )
                {
                   base = check(target,base);
                }
                if( member.length===1 && base instanceof Module )
                {
                    isStatic = true;
                }
            }
            member.push( name );
            if( flag )
            {
                base = check(name,base);
            }
            return member;
        }

        memberExpression( node );
        return {node,member,description:base};
    }

    ObjectExpression(node,scope, parent)
    {
        const map = {};
        const properties = node.properties.map( (child)=>{
            if( child.type ==="SpreadElement" )
            {
                return this.parser(child,scope,node);
            }
            const key = child.key.value || child.key.name;
            const value = this.parser(child.value,scope,child);
            map[ key ] = value;
            return {node:child,key,value};
        });
        const base = new Expression("Object", map);
        return {node,properties,description:base};
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        const fnScope = scope.getScopeByType("function");
        const has = fnScope.createThisRef();
        if( has )
        {
           const name = fnScope.getThisRef();
           fnScope.pushBefore( this.semicolon(
                scope,
                this.makeDeclarationVariable(
                    scope,
                    "const",
                    [this.makeAssign(name,this.makeThisExpression(),null,this.compilation.module.id)]
                )
            ));

            if( fnScope.parent instanceof ClassScope )
            {
                fnScope.define( name, scope.define("this") );
            }
        }
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
                declar = new Parameter(name, defaultValue, type);
                this.setAssignment(declar, defaultValue );
                
            }else
            {
                name = item.name;
                type = this.parser(item.acceptType,scope,parent);
                declar = new Parameter(name, defaultValue, type, item.type === "RestElement");
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
            key = this.parser(parent.key,scope,node);
            if( !key && parent.kind === "constructor" )
            {
                key = "constructor";
            }

            if( !parent.static )
            {
               scope.define( "this", this.module);
            }
        }

        scope.key = key;
        scope.isExpression = isExpression;
        scope.returnType = this.parser(node.returnType,scope,node);
        scope.params     = this.parserFunctionParams(scope,node.params);
        this.parser(node.body,scope,node);
        return scope;
    }

    ArrayExpression(node,scope, parent)
    {
        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        const base = new Expression("Array",elements);
        return {node,elements,description:base};
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        return {node,left,right};
    }

    AssignmentExpression(node, scope, parent)
    {
        const left = this.parser( node.left, scope, node );
        const right = this.parser( node.right, scope, node);
        const declar = scope.define( left );
        if( !declar )
        {
            this.error( `"${left}" is not defined.`, node);
        }
        this.setAssignment(declar, right);
        return {node,elements,description:declar};
    }

    ThisExpression(node, scope, parent)
    {
        let fnScope = scope.getScopeByType("function");
        const base = scope.define( fnScope.isArrow ? fnScope.getThisRef() : "this" );
        return {node,description:base};
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

        if( !desc || !(desc.kind ==="method" || desc instanceof FunctionScope ) )
        {
            this.error(`"${target}" is not method`, node);
        }        
        return {node,arguments:args,description}
    }

    NewExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const description = target.description;
        const args = node.arguments.map( (item,index)=>{
            const val = this.parser(item,scope,node);
            if( description.params[index] )
            {
               this.compilation.checkType( description.params[index], val.type );
            }
            return val;
        });
        return {node,arguments:args,description}
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
        return {node,argument,description:new Type("Number")};
    }

    UnaryExpression(node,scope, parent)
    {
        const argument = this.parser(node.argument, scope, node);
        return {node,argument,description:new Type("Number")};
    }

    BlockStatement(node,scope,parent)
    {
        const body = node.body.map( (item)=>{
           return this.parser(item,scope,node);
        });
        return {node,body};
    }

    IfStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        return {node,condition,consequent,alternate};
    }

    WhileStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const condition = this.parser(node.test,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,condition,body};
    }

    DoWhileStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const condition  = this.parser(node.test,scope,node);
        const body =  this.parser(node.body,scope,node);
        return {node,condition,body};
    }

    SwitchStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const condition  = this.parser(node.discriminant,scope,node);
        const cases = node.cases.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return {node,condition,cases};
    }

    SwitchCase(node,scope,parent)
    {
        scope = new BlockScope( scope );
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
        scope = new BlockScope( scope );
        const init = this.parser(node.init,scope,node);
        const condition = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        const body = this.parser(node.body,scope,node); 
        return {node,init,condition,update,body};
    }

    ForInStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const left = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,left,right,body};
    }

    ForOfStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const left = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        return {node,left,right,body};
    }

    TryStatement(node,scope, parent)
    {
        scope = new BlockScope( scope );
        const name = node.handler.param.name;
        const acceptType = this.parser( node.handler.param.acceptType, scope, node);
        const handler    = this.parser( node.handler.body, scope, node);
        const body = this.parser(node.block, scope, node);
        return {node,name,acceptType,body,handler};
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
                consequent = this.isRuntime( args[0] )
            break;
        }

        let body = [];
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
        return this.parser( node.expression, scope, node );
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
                return new Declaration(node,kind,declarations,true);
        }

        return new Declaration(node,kind,declarations);
    }

    VariableDeclarator(node,scope,parent)
    {
        if( node.id && node.id.type ==="ArrayPattern" )
        {
            const initType = node.init.type;
            const initVlaue = this.parser(node.init,scope,node.id);
            return node.id.elements.map( (item,index)=>{
                const init =item.type === "AssignmentPattern" ? this.parser(item.right, scope, item) : null;
                const id =  item.type === "AssignmentPattern" ? item.left.name : item.name;
                const acceptType =  item.type === "AssignmentPattern" ? this.parser(item.left.acceptType,scope,item) : this.parser(item.acceptType,scope,item); 
                const declar = new Declarator(id, parent.kind, null, acceptType, init);
                scope.define(id, declar);
                if( initType==="ArrayExpression" ){
                    declar.initValue =  initVlaue.target[ index ] ? initVlaue.target[ index ].target : null;
                }else{
                    declar.initValue = `${initVlaue}[${index}]`;
                }
                return declar;
            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            let initType = node.init.type;
            let initVlaue = this.parser( node.init, scope, node);
            return node.id.properties.map( (item,index)=>{
                const acceptType = this.parser(item.acceptType,scope, node.id);
                const id = item.key.name;
                const init = this.parser(item.value.right,scope, node.id);
                const declar = new Declarator(id, parent.kind, null, acceptType, init);
                scope.define(id, declar);
                if( initType==="ObjectExpression" ){
                    declar.initValue = initVlaue[id];
                }else{
                    declar.initValue = `${initVlaue}["${id}"]`;
                }
                this.checkProp(initVlaue,id,item);
                return declar;
            });
        }

        const id = node.id.name;  
        const acceptType = this.parser(node.id.acceptType,scope,node);
        const init       = this.parser(node.init,scope,node);
        const declar     = new Declarator(id,parent.kind, init, acceptType);
        scope.define(id, declar);
        return declar;
    }

    checkProp(target,prop,node)
    {
        if( target )
        {
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
        if( value )
        {
            declar.target = value;
        }
    }

    FunctionDeclaration(node,scope,parent)
    {
        const key = node.id.name;
        const fnScope = new FunctionScope(scope, false, false, true);
        fnScope.key = key;
        fnScope.define("this", new Type("Object") );
        fnScope.arguments = this.parserFunctionParams(fnScope,node.params);
        fnScope.returnType = this.parser(node.returnType, scope, node);
        fnScope.body = this.parser(node.body,fnScope,node);
        scope.define(key,fnScope);
        return fnScope;
    }

    EnumDeclaration(node,scope,parent)
    {
        const id = node.name;
        const inherit = this.parser(node.extends,scope,node);
        const properties = {};
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? this.parser(item.right,scope,item) : new Expression(item,lastValue++,"Number");
            properties[ key ] = value;
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        const obj = new Enum(node, properties, inherit);
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
            const value = this.parser(item.value);
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
        module.extends = node.superClass ? this.parser(node.superClass, scope, node).description : null;
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item,scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        const body= (node.body && node.body.body)||[];
        const parseStruct = (flag)=>{
            this.hasStruct = flag;
            const classScope = new ClassScope( scope, !!node.static );
            (body).forEach( (item)=>{
                if( !flag || item.type==="MethodDefinition")
                {
                   this.parser(item,classScope,node);
                }
            });
            scope.removeChild(classScope);
        }
        parseStruct(false);
        parseStruct(true);
    }

    InterfaceDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.id = this.parser(node.id, scope, node);
        module.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        const body= (node.body && node.body.body)||[];
        scope = new ClassScope(scope);
        (body).forEach( (item)=>{
            this.parser(item,scope,node);
        });
    }

    DeclaratorDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.id = node.id.name;
        module.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
        const body= (node.body && node.body.body)||[];
        scope = new ClassScope(scope);
        (body).forEach( (item)=>{
            this.parser(item,scope,node);
        });
        this.hasStruct = true;
    }

    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.MemberExpression(node.id,scope,node,false) : null;
        this.module.namespace = Namespace.create( id ? id.member.join(".") : null );
        this.enter( node.body, scope, node );
    }

    TypeDefinition( node,scope, parent)
    {
       const type = this.parser(node.value,scope,node);
       return type;
    }

    PropertyDefinition(node,scope, parent)
    {
        const modifier = this.parser(node.modifier, scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        const desc = new PropertyDescription(declar.key,declar.kind,declar.acceptType,!!node.static,modifier);
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.compilation.module.addMember(desc.key, desc);
    }

    MethodDefinition(node,scope, parent)
    {
       const key = node.key.name ;
       const isStatic = !!node.static;
       const module = this.compilation.module;
       if( !this.hasStruct )
       {
            const kind = node.kind;
            const modifier = this.parser(node.modifier,scope, node);
            const metatypes = this.metatypes.splice(0,this.metatypes.length);
            const annotations = this.annotations.splice(0,this.annotations.length);
            const params = this.parserFunctionParams( scope, node.value.params );
            const isConstruct = kind ==="constructor" || module.id === key;
            const returnType = isConstruct ? module : this.parser(node.returnType, scope, node);
            const desc = new MethodDescription(key,kind,returnType,isStatic,modifier,params);
            desc.metatypes = metatypes;
            desc.annotations = annotations;
            if( isConstruct )
            {
                module.constructor = desc;
            }
            module.addMember(key, desc);

       }else
       {
            let desc = this.compilation.getDescribe( key, isStatic );
            desc.body = this.parser( node.value, scope, node);
            console.log( desc.body )
       }

    }

    Program(node, scope, parent)
    {
       return this.enter(node.body, scope, node);
    }

    Identifier(node, scope, parent)
    {
        const ref = scope.define( node.name ) || this.compilation.getType( node.name );
        if( !ref )
        {
            this.compilation.throwError(`"${node.name }" is not defined`, node.start )
        }
        return {node,value:node.name,description:ref};
    }

    Literal(node,scope,parent)
    {
        let type = "String";
        const value = node.raw || node.value;
        if( node.regex )
        {
            type= "RegEx";

        }else if(node.value == node.raw)
        {
            type= "Number";
        }else if( node.raw === "false" || node.raw === "true")
        {
            type = "Boolean";
        }
        return {node,value,type};
    }

    enter(body, scope, parent)
    {
        return body instanceof Array && body.map( (item)=>{
            return this.parser( item, scope, parent );
        }).join("");
    }


    parser(node,scope,parent=null,flag)
    {
        if( !node )
        {
            return null;
        }
        return this[ node.type ](node,scope,parent,flag);
    }
}

module.exports = Grammar;