import Vue from 'vue';
const GLUniform = {
    props:['name'],
    watch:{
        value(val){
            if(this.type==='samplerCube'){
                const samplerType = ['front','back','left','right','top','bottom'];
                const errorStr = JSON.stringify(samplerType);
                if(Object.keys(val).sort().join('|').indexOf(samplerType.sort().join('|'))<0){
                    throw new Error(`\nType ${this.type}(${this.name}) value must contain:\n\t${errorStr}\n`);
                }
            }
            this.$parent.setUniform(this);
        }
    },
    created(){
        this.$parent.registerUniform(this);
    }
}
export const GlInt = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Number,
            default:0,
        }
    },
    data(){
        return{
            type:'int',
        }
    }
});
export const GlFloat = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Number,
            default:0,
        }
    },
    data(){
        return{
            type:'float',
        }
    }
});
export const GlVec2 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[0,0],
        }
    },
    data(){
        return{
            type:'vec2',
        }
    }
});
export const GlVec3 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[0,0,0],
        }
    },
    data(){
        return{
            type:'vec3',
        }
    }
});
export const GlVec4 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[0,0,0,0],
        }
    },
    data(){
        return{
            type:'vec4',
        }
    }
});
export const GlMat2 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[
                0,0,
                0,0
            ],
        }
    },
    data(){
        return{
            type:'mat2',
        }
    }
});
export const GlMat3 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[
                0,0,0,
                0,0,0,
                0,0,0,
            ],
        }
    },
    data(){
        return{
            type:'mat3',
        }
    }
});
export const GlMat4 = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        value:{
            type:Array,
            default:[
                0,0,0,0,
                0,0,0,0,
                0,0,0,0,
                0,0,0,0
            ],
        }
    },
    data(){
        return{
            type:'mat4',
        }
    }
});
export const GlTexture = Vue.extend({
    mixins: [GLUniform],
    render:()=>null,
    props:{
        repeat:{
            type:Number,
            default:-1,//0:CLAMP_TO_EDGE 1:REPEAT 2:MIRRORED_REPEAT
        },
        repeatX:{
            type:Number,
            default:0,//0:CLAMP_TO_EDGE 1:REPEAT 2:MIRRORED_REPEAT
        },
        repeatY:{
            type:Number,
            default:0,//0:CLAMP_TO_EDGE 1:REPEAT 2:MIRRORED_REPEAT
        },
        value:{
            default:"",
        }
    },
    computed:{
        type(){
            if(typeof this.value === 'string'||this.value instanceof HTMLElement){
                return 'sampler2D';
            }
            return 'samplerCube';
        },
        _repeatX():number{
            let repeat = this.repeatX;
            if(this.repeat>=0){
                repeat = this.repeat;
            }
            return Math.max(0,Math.min(2,repeat));
        },
        _repeatY():number{
            let repeat = this.repeatY;
            if(this.repeat>=0){
                repeat = this.repeat;
            }
            return Math.max(0,Math.min(2,repeat));
        }
    },
    watch:{
        _repeatX(){
            if(this.type==='sampler2D') this.$parent['setUniform'](this);
        },
        _repeatY(){
            if(this.type==='sampler2D') this.$parent['setUniform'](this);
        }
    }
});