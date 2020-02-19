
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {int,float,vec2,vec3,vec4,mat2,mat3,mat4,sampler2D,samplerCube} from './ContextManager';
class GLUniform extends Vue{
    @Prop()protected readonly name:string;
    protected type;
    @Watch('value',{immediate: true, deep: true})protected valueChange(val){
        if(this.type==='samplerCube'){
            const samplerType = ['front','back','left','right','top','bottom'];
            const errorStr = JSON.stringify(samplerType);
            if(Object.keys(val).sort().join('|').indexOf(samplerType.sort().join('|'))<0){
                throw new Error(`\nType ${this.type}(${this.name}) value must contain:\n\t${errorStr}\n`);
            }
        }
        this.$parent['setUniform'](this);
    }
    protected created(){
        this.$parent['registerUniform'](this);
    }
};
@Component
export class GlInt extends GLUniform{
    protected readonly type:string="int";
    @Prop({default:0})protected readonly value:int;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlFloat extends GLUniform{
    protected readonly type:string="float";
    @Prop({default:0})protected readonly value:float;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlVec2 extends GLUniform{
    protected readonly type:string="vec2";
    @Prop({default:[0,0]})protected readonly value:vec2;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlVec3 extends GLUniform{
    protected readonly type:string="vec3";
    @Prop({default:[0,0,0]})protected readonly value:vec3;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlVec4 extends GLUniform{
    protected readonly type:string="vec4";
    @Prop({default:[0,0,0,0]})protected readonly value:vec4;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlMat2 extends GLUniform{
    protected readonly type:string="mat2";
    @Prop({default:[0,0,0,0]})protected readonly value:mat2;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlMat3 extends GLUniform{
    protected readonly type:string="mat3";
    @Prop({default:[0,0,0,0,0,0,0,0,0]})protected readonly value:mat3;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlMat4 extends GLUniform{
    protected readonly type:string="mat4";
    @Prop({default:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]})protected readonly value:mat4;
    private render(){}
    protected created(){
        super.created();
    }
};
@Component
export class GlTexture extends GLUniform{
    @Prop({default:0})private readonly repeatX:number;//0:CLAMP_TO_EDGE 1:REPEAT 2:MIRRORED_REPEAT
    @Prop({default:0})private readonly repeatY:number;
    @Prop({default:-1})private readonly repeat:number;
    @Prop({default:''})protected readonly value:sampler2D|samplerCube;
    protected get type(){
        if(typeof this.value === 'string'||this.value instanceof HTMLElement){
            return 'sampler2D';
        }
        return 'samplerCube';
    };
    private get _repeatX():number{
        let repeat = this.repeatX;
        if(this.repeat>=0){
            repeat = this.repeat;
        }
        return Math.max(0,Math.min(2,repeat));
    }
    private get _repeatY():number{
        let repeat = this.repeatY;
        if(this.repeat>=0){
            repeat = this.repeat;
        }
        return Math.max(0,Math.min(2,repeat));
    }
    @Watch('_repeatX')protected repeatXChange(){
        if(this.type==='sampler2D') this.$parent['setUniform'](this);
    }
    @Watch('_repeatX')protected repeatYChange(){
        if(this.type==='sampler2D') this.$parent['setUniform'](this);
    }
    private render(){}
    protected created(){
        super.created();
    }
};