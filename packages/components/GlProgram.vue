<template>
    <span>
        <slot/>
    </span>
</template>
<script lang="ts">
    import { Vue, Component, Prop,Inject } from 'vue-property-decorator';
    import ContextManager from './ContextManager';
    import {uniformType} from './ContextManager';
    interface UniformVue extends Vue{
        type:string;
        name:string;
        value:uniformType;
        _repeatX?:number;
        _repeatY?:number;
    }
    @Component
    export default class GLProgram extends Vue{
        @Prop({default:'main'})private readonly name!:string;
        @Prop({default:''})private readonly code!:string;
        @Inject()private readonly glContext!:ContextManager;
        private timer!:number;
        private created(){
            this.glContext.initProgram(this.name,this.code);
            this.updateProgram();
        }
        private registerUniform(uniformVue:UniformVue){
            clearTimeout(this.timer);
            if(uniformVue.type.indexOf('sampler')>=0){
                this.glContext.initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
            }else{
                this.glContext.initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value);
            }
            this.updateProgram();
        }
        private updateProgram(){
            this.timer = setTimeout(()=>{
                this.glContext.updateProgram(this.name);
            },0);
        }
        private setUniform(uniformVue:UniformVue){
            if(uniformVue.type.indexOf('sampler')>=0){
                this.glContext.setUniform(this.name,uniformVue.name,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
            }else{
                this.glContext.setUniform(this.name,uniformVue.name,uniformVue.value);
            }
        }
    };
</script>
