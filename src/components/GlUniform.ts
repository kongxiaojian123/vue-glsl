const GLUniform = {
    name:'GLUniform',
    props:['name'],
    watch:{
        value(val:any){
            // @ts-ignore
            if(this.type==='samplerCube'){
                const samplerType = ['front','back','left','right','top','bottom'];
                const errorStr = JSON.stringify(samplerType);
                if(Object.keys(val).sort().join('|').indexOf(samplerType.sort().join('|'))<0){
                  // @ts-ignore
                  throw new Error(`\nType ${this.type}(${this.name}) value must contain:\n\t${errorStr}\n`);
                }
            }
            // @ts-ignore
            this.$parent.setUniform(this);
        }
    },
    created(){
      // @ts-ignore
      this.$parent.registerUniform(this);
    }
}
export const GlInt = {
    name:'GlInt',
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
};
export const GlFloat = {
    name:'GlFloat',
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
};
export const GlVec2 = {
    name:'GlVec2',
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
};
export const GlVec3 = {
    name:'GlVec3',
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
};
export const GlVec4 = {
    name:'GlVec4',
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
};
export const GlMat2 = {
    name:'GlMat2',
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
};
export const GlMat3 = {
    name:'GlMat3',
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
};
export const GlMat4 = {
    name:'GlMat4',
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
};
export const GlTexture = {
    name:'GlTexture',
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
          // @ts-ignore
          if(typeof this.value === 'string' || this.value instanceof HTMLElement){
              return 'sampler2D';
          }
          return 'samplerCube';
        },
        _repeatX():number{
          // @ts-ignore
          let repeat = this.repeatX;
          // @ts-ignore
          if(this.repeat>=0){
            // @ts-ignore
            repeat = this.repeat;
          }
          return Math.max(0,Math.min(2,repeat));
        },
        _repeatY():number{
          // @ts-ignore
          let repeat = this.repeatY;
          // @ts-ignore
          if(this.repeat>=0){
            // @ts-ignore
            repeat = this.repeat;
          }
          return Math.max(0,Math.min(2,repeat));
        }
    },
    watch:{
        _repeatX(){
          // @ts-ignore
          if(this.type==='sampler2D') this.$parent['setUniform'](this);
        },
        _repeatY(){
          // @ts-ignore
          if(this.type==='sampler2D') this.$parent['setUniform'](this);
        }
    }
};