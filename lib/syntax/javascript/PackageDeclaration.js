const Utils = require("../../Utils");
const Syntax = require("./Syntax");
class PackageDeclaration extends Syntax{

    makeClass(syntax){
        const module = this.compilation.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
        const make=(item,name,modifier)=>{
            if( !item )return null;
            const metaTypes = item.metatypes;
            const annotations = item.annotations;
            if( !this.checkMetaTypeSyntax(metaTypes) ){
                return null;
            }
            const value = item.isPropertyDefinition && item.init ? item.init.emit(syntax) : item.emit(syntax);
            if( value ){
                if( item.isPropertyDefinition ){
                    if( !item.static ){
                        properties.push(`"${name}":${value||null}`);
                        return null;
                    }
                    return value;
                }else{
                    return value;
                }
            }
            return null;
        }
        const emiter=(target,proto,content)=>{
            for( var name in target ){
                const item = target[ name ];
                const modifier = item.modifier ? item.modifier.value() : 'public';
                if( item.isPropertyDefinition && !item.static ){
                    const value = make(item,name,modifier);
                    if( modifier !=="private" ){
                        const getter = `function get${Utils.firstToUpper(name)}(){\r\n\t\treturn this[private].${name};\r\n\t}`;
                        const setter = `function set${Utils.firstToUpper(name)}(value){\r\n\t\tthis[private].${name}=value;\r\n\t}`;
                        content.push(this.definePropertyDescription(proto,name,{
                            get:getter,
                            set:setter
                        },true,modifier,0));
                    }else{
                        content.push(this.definePropertyDescription(proto,name,value,true,modifier,0));
                    }
                }else if( item.isAccessor ){
                    content.push(this.definePropertyDescription(proto,name,{
                        get:make(item.get,name,modifier),
                        set:make(item.set,name,modifier)
                    },true,modifier,1));
                }else{
                    content.push(this.definePropertyDescription(proto,name,make(item,name,modifier),false,modifier, item.isPropertyDefinition ? 0 : 1));
                }
            }
        }
        const methodContent = [];
        const memberContent = [];
        emiter( methods , 'methods', methodContent );
        emiter( members , `members`, memberContent );
        const parentClass =  module.extends.length > 0 ? module.extends[0].id : 'Object';
        const callSuper = module.extends.length > 0 ? `${module.extends[0].id}.call(this);` : '';
        if( properties.length > 0 ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
            });
        }
        const construct = module.methodConstructor ? module.methodConstructor.emit( syntax ) : `function ${module.id}(){${callSuper}}`;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [`\tconst private=Symbol("private");`];
        const description = [
            `\t\tid:1`,
            `\t\tns:${this.getIdByNamespace(module.namespace)}`,
            `\t\tname:"${module.getName()}"`,
            `\t\tprivate:private`,
        ];
        if( imps.length > 0 ){
            description.push(`\t\timps:[${imps.map(item=>item.id).join(",")}]`);
        }
        if( inherit ){
            description.push(`\t\tinherit:${inherit.id}`);
        }
        const lazyLoad = [];
        module.imports.forEach(refModule=>{
            if( refModule.used ){
                if(this.checkDepend(module,refModule) > 0 ){
                    lazyLoad.push( refModule );
                }else{
                    refs.push(`\tconst ${refModule.id} = System.getClass(${this.getIdByModule(refModule)});`);
                }
            }
        });

        const lazyLoadQueue = [];
        lazyLoad.forEach(refModule=>{
            refs.push(`\tvar ${refModule.id} = null;`);
            lazyLoadQueue.push(`\t\t${refModule.id} = System.getClass(${this.getIdByModule(refModule)});`);
        });

        if( methodContent.length > 0 ){
            content.push(`\tconst methods = {};`);
            content.push( methodContent.join("\r\n") )
            description.push(`\t\tmethods:methods`);
        }

        if( memberContent.length > 0 ){
            content.push(`\tconst members = {};`);
            content.push( memberContent.join("\r\n") )
            description.push(`\t\tmembers:members`);
        }

        if( lazyLoadQueue.length >0){
            this.compilation.compiler.hasDelayClass=true;
            content.push(`\tdelayClass.push(function(){\r\n${lazyLoadQueue.join("\r\n")}\r\n\t});`)
        }

        const code = [
            `(function(System){`,
            refs.join("\r\n"),
            `\t${construct}`,
            content.join("\r\n"),
            `\tSystem.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`,
            `})(System);`
        ];
        return code.filter( value=>!!value ).join("\r\n");
    }
    makeInterface(syntax){
        const module = this.compilation.module;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const description = [
            `\t\tid:0`,
            `\t\tns:${this.getIdByNamespace(module.namespace)}`,
            `\t\tname:"${module.getName()}"`
        ];
        if( imps.length > 0 ){
            description.push(`\t\timps:[${imps.map( item=>item.id ).join(",")}]`);
        }
        if( inherit ){
            description.push(`\t\tinherit:${inherit.id}`);
        }
        const lazyLoad = [];
        module.imports.forEach(module=>{
            if( module.used ){
                if(this.checkDepend(module,refModule) > 0 ){
                    lazyLoad.push( refModule );
                }else{
                    refs.push(`\tconst ${module.id} = System.getClass(${this.getIdByModule(module)});`);
                }
            }
        });
        const lazyLoadQueue = [];
        lazyLoad.forEach(refModule=>{
            refs.push(`\tvar ${refModule.id} = null;`);
            lazyLoadQueue.push(`\t\t${refModule.id} = System.getClass(${this.getIdByModule(refModule)});`);
        });
        if( lazyLoadQueue.length >0){
            this.compilation.compiler.hasDelayClass=true;
            refs.push(`\tdelayClass.push(function(){\r\n${lazyLoadQueue.join("\r\n")}\r\n\t});`)
        }
        const code = [
            `(function(System){`,
            refs.join("\r\n"),
            `\tfunction ${module.id}(){}`,
            `\tSystem.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`,
            `})(System);`
        ];
        return code.filter( value=>!!value ).join("\r\n");
    }
    defineProperty(target,name,value,isAccessor){
        const option = this.getSyntaxOption();
        if( isAccessor ){
            const accessor = [];
            if( value.get ){
                if( option.target === "es5" ){
                    accessor.push( this.defineProperty(target, `get`+Utils.firstToUpper(name), value.get) );
                }else{
                    accessor.push(`\tget:`+value.get);
                }
            }
            if( value.set ){
                if( option.target === "es5" ){
                    accessor.push( this.defineProperty(target, `set`+Utils.firstToUpper(name), value.set) );
                }else{
                    accessor.push(`\tset:`+value.set);
                }
            }
            if( option.target === "es5" ){
                return accessor.join("\r\n");
            }
            return `\tObject.defineProperty(${target},"${name}",{\r\n${accessor.join(",\r\n")}});`;
        }
        if( option.useDefineProperty ){
            return `\tObject.defineProperty(${target},"${name}",{value:${value}});`;
        }
        
        return `\t${target}.${name}=${value};`
    }
    definePropertyDescription(target,name,value,isAccessor,modifier,id){
        const map={
            "public":2,
            "protected":1,
            "private":0,
        }
        const items = [`m:${map[modifier]},d:${id}`];
        if( isAccessor ){
            if( value.get ){
                items.push(`get:`+value.get);
            }
            if( value.set ){
                items.push(`set:`+value.set);
            }
        }else{
            items.push(`value:`+value);
        }
        return `\t${target}.${name}={${items.join(",")}};`
    }
    checkDepend(module,refModule){
        return refModule.extends.concat(refModule.implements).some( refModule=>{
            if(refModule === module)return true;
            return this.checkDepend(module,refModule);
        });
    }
    getDescription(description){
       if( description.length >0 ){
           return `{\r\n${description.join(",\r\n")}\r\n\t}`;
       }
       return `{}`;
    }
    getImps(module){
        return module.implements.filter( module=>module.isInterface );
    }
    getInherit(module){
        const inherit = module.extends.filter( module=>module.isClass );
        return inherit[0] || null;
    }
    emit(syntax){
        const module = this.compilation.module;
        if( module.isClass ){
            return this.makeClass(syntax);
        }else if( module.isInterface ){
            return this.makeInterface(syntax);
        }
        return '';
    }
}

module.exports = PackageDeclaration;