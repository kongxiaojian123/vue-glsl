<template>
    <span>
        <slot/>
    </span>
</template>
<script lang="ts">
    import {uniformType} from './ContextManager';
    import Vue from 'vue'
    interface UniformVue extends Vue{
        type:string;
        name:string;
        value:uniformType;
        _repeatX?:number;
        _repeatY?:number;
    }
    export default Vue.extend({
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
                timer:null,
            }
        },
        created(){
            this.glContext.initProgram(this.name,this.code);
            this.updateProgram();
        },
        methods:{
            registerUniform(uniformVue:UniformVue){
                clearTimeout(this.timer);
                if(uniformVue.type.indexOf('sampler')>=0){
                    this.glContext.initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
                }else{
                    this.glContext.initUniform(this.name,uniformVue.name,uniformVue.type,uniformVue.value);
                }
                this.updateProgram();
            },
            updateProgram(){
                this.timer = setTimeout(()=>{
                    this.glContext.updateProgram(this.name);
                },0);
            },
            setUniform(uniformVue:UniformVue){
                if(uniformVue.type.indexOf('sampler')>=0){
                    this.glContext.setUniform(this.name,uniformVue.name,uniformVue.value,uniformVue._repeatX,uniformVue._repeatY);
                }else{
                    this.glContext.setUniform(this.name,uniformVue.name,uniformVue.value);
                }
            }
        }
    });
</script>
