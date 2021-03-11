const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIdentifier= true;
        this.acceptType = Utils.createStack(compilation,node.acceptType,scope,node,this);   
    }

    definition(){
        if( this.parentStack ){
            if( this.parentStack.isMemberExpression || this.parentStack.isCallExpression || 
               this.parentStack.isNewExpression || this.parentStack.isImportDeclaration  ||
               this.parentStack.isTypeDefinition
            ){
               return this.parentStack.definition();
            }
        }
        const context = this.description();
        if( context ){
            if( context.isType && context.isModule && (context.isClass || context.isDeclarator || context.isInterface) ){
                const type = this.type().toString();
                const identifier = this.value();
                const kind = context.isClass || context.isDeclarator? 'Class' : "Interface";
                const owner = context.getName();
                return {
                    kind:kind,
                    comments:context.comments,
                    identifier:identifier,
                    expre:`${kind} ${owner}`,
                    type:type,
                    start:this.node.start,
                    end:this.node.end,
                    file:context.compilation.module.file,
                    context
                };
            }else if( (context.isDeclarator || context.isProperty) && context.isStack ){
                return context.definition();
            }
        } 
        if( this.parentStack ){
            return this.parentStack.definition();
        }
    }

    reference(){
        const value = this.value();
        const description = this.scope.define( value );
        if(description && description !== this && description instanceof Stack ){
            return description.reference();
        }
        return this;
    }

    referenceItems(){
        const value = this.value();
        const description = this.scope.define( value );
        if(description && description !== this && description instanceof Stack ){
            return description.referenceItems();
        }
        return [this];
    }

    description(){
        if( this.acceptType ){
            return this.acceptType;
        }
        const value = this.value();
        return this.scope.define( value ) || this.compilation.getType( value );
    }

    check(){
        if( !(this.scope.type("blank") || this.parentNode.type==="Property") ){
            const value = this.value();
            const description = this.scope.define( value ) || this.compilation.getType( value );
            if( !description ){
                this.throwError(`"${value}" is not defined`);
            }
        }
    }

    type(){
        if( this.acceptType ){
            return this.acceptType.type();
        }
        const value = this.value();
        const description = this.scope.define( value ) || this.compilation.getType( value );
        return description instanceof Stack ? description.type() : description;
    }

    value(){
        return this.node.name;
    }

    raw(){
        return this.node.name;
    }
}

module.exports = Identifier;