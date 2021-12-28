<template>
    <canvas ref="canvas">
        <slot/>
    </canvas>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ContextManager from './ContextManager';
export default defineComponent({
    emits: ['update'],
    provide(){
        return{
            glContext:this.glContext,
        }
    },
    props:{
        width:{
            type:[String, Number],
            default:null,
        },
        height:{
            type:[String, Number],
            default:null,
        },
        code:{
            type:String,
            default:'',
        }
    },
    watch:{
      code(val:string){
        this.glContext.commonCode = val;
        console.log(this);
      }
    },
    data(){
      return{
          canvasRect:null as DOMRect|null,
          glContext:new ContextManager(),
      }
    },
    methods:{
        setSize(){
            const canvas = <HTMLCanvasElement>this.$refs.canvas;
            const parentElement = <HTMLElement>canvas.parentElement;
            canvas.width = (isNaN(+this.width)?'':+this.width)||parentElement.clientWidth;
            canvas.height = (isNaN(+this.height)?'':+this.height)||parentElement.clientHeight;
            this.canvasRect = canvas.getBoundingClientRect();
            const glContext = this.glContext;
            glContext.init(canvas,this.canvasRect,this.code);
            glContext.onUpdate=()=>{
                this.$emit('update',{
                    iResolution:[...(glContext.iResolution as unknown as number[])],
                    iTime:glContext.iTime,
                    iTimeDelta:glContext.iTimeDelta,
                    iFrame:glContext.iFrame,
                    iMouse:[...(glContext.iMouse as unknown as number[])],
                    iDate:[...(glContext.iDate as unknown as number[])],
                });
            };
        }
    },
    mounted(){
      this.setSize();
    },
    unmounted(){
        this.glContext.destroy();
    }
});
</script>
<style scoped>
    canvas{
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
