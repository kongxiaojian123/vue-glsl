<template>
    <span>
        <slot/>
    </span>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ContextManager, {uniformType} from './ContextManager';
interface UniformVue{
    type:string;
    name:string;
    value:uniformType;
    _repeatX?:number;
    _repeatY?:number;
}
export default defineComponent({
    inject: ['glContext'],
    props:{
        name:{
            type:String,
            default:'main',
        },
        code:{
            type:String,
            default:'',
        }
    },
    data(){
        return{
            timer:null as number|null,
        }
    },
    created(){
        // @ts-ignore
        (this.glContext as ContextManager).initProgram(this.name,this.code);
        this.updateProgram();
    },
    methods:{
        registerUniform(uniformVue:UniformVue){
            clearTimeout(this.timer!);
            if(uniformVue.type.indexOf('sampler')>=0){
              // @ts-ignore
              (this.glContext as ContextManager).initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
            }else{
              // @ts-ignore
              (this.glContext as ContextManager).initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value);
            }
            this.updateProgram();
        },
        updateProgram(){
            this.timer = setTimeout(()=>{
                // @ts-ignore
                (this.glContext as ContextManager).updateProgram(this.name);
            },0);
        },
        setUniform(uniformVue:UniformVue){
            if(uniformVue.type.indexOf('sampler')>=0){
              // @ts-ignore
              (this.glContext as ContextManager).setUniform(this.name,uniformVue.name,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
            }else{
              // @ts-ignore
              (this.glContext as ContextManager).setUniform(this.name,uniformVue.name,uniformVue.value);
            }
        }
    }
});
</script>
