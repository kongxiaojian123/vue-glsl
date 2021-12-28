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
      paused:{
          type: Boolean,
          default: false,
      },
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
      },
      paused(val:boolean){
        this.glContext.paused = val;
      }
    },
    data(){
      return{
          canvasRect:null as DOMRect|null,
          glContext:new ContextManager(this.paused),
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
