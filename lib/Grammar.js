const fs     = require("fs");
const events = require('events');
const TopScope = require("./scope/TopScope.js");
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

class Grammar extends events.EventEmitter 
{
    constructor( module )
    {
       super(); 
       this.module   = module;
    }

    MemberExpression(node,scope,parent)
    {
        const expre    = new MemberExpression(node,scope,parent);
        expre.property = this.parser(node.property,scope,node);
        expre.object   = this.parser(node.object,scope,node);
        return expre;
    }

    ObjectExpression(node, scope, parent)
    {
        const expre = new ObjectExpression(node, scope, parent);
        expre.properties = node.properties.map( (child)=>{
            return this.parser(child,scope,node);
        });
        return expre;
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        return this.FunctionExpression(node,scope,parent,true,!!node.expression);
    }

    parserFunctionParams(scope,items,parent)
    {
        return items.map( (item)=>{
            const epxre = this.parser(item,scope,parent);
            const name  = epxre.raw();
            scope.define(name, epxre);
        });
    }

    FunctionExpression(node,scope,parent,isArrow,isExpression)
    {
        const isMethod = parent && parent.type ==="MethodDefinition";
        const fnScope = isMethod ? scope : new FunctionScope( scope, !!isExpression , !!isArrow );
        const expre = new FunctionExpression(node,fnScope,parent)
        expre.body = this.parser(node.body,fnScope,node);
        expre.returnType = this.parser(node.returnType,scope,node);
        expre.arguments  = node.params.map( (item)=>{
            const epxre = this.parser(item,scope,parent);
            const name  = epxre.raw();
            fnScope.define(name, epxre);
        });
        return expre;
    }

    ArrayExpression(node,scope, parent)
    {
        const expre = new ArrayExpression(node,scope,parent)
        expre.elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return expre;
    }

    LogicalExpression(node,scope, parent)
    {
        const expre = new LogicalExpression(node,scope,parent);
        expre.left  =  this.parser(node.left,scope,node);
        expre.right =  this.parser(node.right,scope,node);
        return expre;
    }

    AssignmentExpression(node, scope, parent)
    {
        const expre = new AssignmentExpression(node,scope,parent);
        expre.left  =  this.parser(node.left,scope,node);
        expre.right =  this.parser(node.right,scope,node);
        expre.acceptType = this.parser(node.left.acceptType,scope,node);
        return expre;
    }

    ThisExpression(node, scope, parent)
    {
        return new ThisExpression(node, scope, parent);
    }

    BinaryExpression(node, scope, parent)
    {
        const expre =  new BinaryExpression(node,scope,parent);
        expre.left  =  this.parser(node.left,scope,node);
        expre.right =  this.parser(node.right,scope,node);
        return expre;
    }

    CallExpression(node, scope, parent)
    {
        const expre =  new CallExpression(node,scope,parent);
        expre.callee = this.parser(node.callee,scope,node);
        return expre;
    }

    NewExpression(node, scope, parent)
    {
        const expre =  new NewExpression(node,scope,parent);
        expre.callee = this.parser(node.callee,scope,node);
        expre.arguments = node.arguments.map( item=>this.parser(item,scope,node));
        return expre;
    }

    SpreadElement(node, scope, parent)
    {
        const expre =  new SpreadElement(node,scope,parent);
        return expre;
    }

    ReturnStatement(node,scope, parent)
    {
        const expre = new ReturnStatement(node,scope,parent);
        expre.argument = this.parser(node.argument,scope,node);
        return expre;
    }

    ExpressionStatement(node,scope, parent)
    {
        const expre = new ReturnStatement(node,scope,parent);
        expre.argument = this.parser(node.expression,scope,node);
        return expre;
    }

    UpdateExpression(node,scope, parent)
    { 
        const expre = new UpdateExpression(node,scope,parent);
        expre.argument = this.parser(node.argument,scope,node);
        return expre;
    }

    UnaryExpression(node,scope, parent)
    {
        const expre = new UnaryExpression(node,scope,parent);
        expre.argument = this.parser(node.argument,scope,node);
        return expre;
    }

    BlockStatement(node,scope,parent)
    {
        if( !(parent && (parent.type === "FunctionExpression" || parent.type === "ArrowFunctionExpression" || parent.type === "FunctionDeclaration") ) )
        {
            scope = new BlockScope( scope );
        }
        const expre = new BlockStatement(node,scope,parent);
        expre.body = node.body.map( (item)=>{
            return this.parser(item,scope,node);
         }).filter( item=>!!item );
        return expre;
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
        return new VariableDeclaration(node,scope,parent,node.declarations.map( item=>{
            return this.parser(item,scope,node);
        }));
    }

    AssignmentPattern(node,scope,parent)
    {
        const expre = new AssignmentPattern(node,scope,parent)
        expre.left  = this.parser(node.left,scope,node)
        expre.right = this.parser(node.right,scope,node)
        return expre;
    }

    ArrayPattern(node,scope,parent)
    {
       const expre = new ArrayPattern(node,scope,parent)
       expre.elements = node.elements.map( item=>this.parser(item,scope,node) )
       return expre;
    }

    ObjectPattern(node,scope,parent)
    {
       const expre = new ObjectPattern(node,scope,parent)
       expre.properties = node.properties.map( item=>this.parser(item,scope,node) )
       return expre;
    }

    VariableDeclarator(node,scope,parent)
    {
        const expre = new VariableDeclarator(node,scope,parent);
        expre.id = this.parser(node.id,scope,node);
        expre.init = this.parser(node.init,scope,node);
        return expre;
    }

    FunctionDeclaration(node,scope,parent)
    {
        const fnScope = new FunctionScope(scope);
        const params =  this.parserFunctionParams(fnScope,node.params);
        const returnType = this.parser(node.returnType, scope, node);
        const body =  this.parser(node.body,fnScope,node);
        const expre = new FunctionDeclaration(node,fnScope,parent);
        fnScope.define("this", new Type("Object") );
        expre.body = body;
        expre.arguments = params;
        expre.returnType = returnType;
        return expre;
    }

    EnumDeclaration(node,scope,parent)
    {
        const expre = new EnumDeclaration(node,scope,parent);
        expre.inherit = this.parser(node.extends,scope,node);
        expre.expressions = node.value.expressions.map( item=>this.parser(item,scope,node) );
        return expre;
    }

    ModifierDeclaration(node,scope,parent)
    {
        return node.value || node.name;
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
        return {node,scope, parent};
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

    MethodDefinition(node,scope,parent)
    {
        const key      = node.key.name;
        const isStatic = !!node.static;
        const module   = this.module;
        const fnScope  = new FunctionScope(scope);
        const kind     = node.kind;
        const modifier = this.parser(node.modifier,scope, node);
        const metatypes = this.metatypes.splice(0,this.metatypes.length);
        const annotations = this.annotations.splice(0,this.annotations.length);
        const params      = this.parserFunctionParams(fnScope, node.value.params );
        const returnType  = isConstruct ? module : this.parser(node.value.returnType, scope, node);
        const description = new MethodDescription(key,kind,returnType,isStatic,modifier,params);
        description.node  = node;
        description.scope = scope;
        description.parent = parent;
        description.metatypes = metatypes;
        description.annotations = annotations;
        scope.key = key;
        if( kind ==="constructor" )
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
        return new Identifier(node,scope,parent);
    }

    Literal(node,scope,parent)
    {
        return new Literal(node,scope,parent);
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
    }
}


module.exports = Grammar;
