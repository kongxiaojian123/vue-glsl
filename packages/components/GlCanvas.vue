<template>
    <canvas ref="canvas">
        <slot/>
    </canvas>
</template>
<script lang="ts">
    import { Vue, Component, Emit, Prop, Provide } from 'vue-property-decorator';
    import ContextManager from './ContextManager';
    @Component
    export default class GlCanvas extends Vue{
        @Prop({default:0})private readonly width!:number;
        @Prop({default:0})private readonly height!:number;
        @Prop({default:null})private readonly code!:string;//common code
        private canvasRect!:DOMRect;
        @Provide() private glContext:ContextManager = new ContextManager();
        private mounted(){
            this.setSize();
        }
        private setSize(){
            const canvas = <HTMLCanvasElement>this.$refs.canvas;
            const parentElement = <HTMLElement>canvas.parentElement;
            canvas.width = this.width||parentElement.clientWidth;
            canvas.height = this.height||parentElement.clientHeight;
            this.canvasRect = canvas.getBoundingClientRect();
            this.glContext.init(canvas,this.canvasRect,this.code);
            this.glContext.onUpdate=()=>{
                this.$emit('update',{
                    iResolution:[...this.glContext.iResolution],
                    iTime:this.glContext.iTime,
                    iTimeDelta:this.glContext.iTimeDelta,
                    iFrame:this.glContext.iFrame,
                    iMouse:[...this.glContext.iMouse],
                    iDate:[...this.glContext.iDate],
                });
            };
        }
        private beforeDestroy(){
            this.glContext.destroy();
        }
    };
</script>
<style scoped>
    canvas{
        width: 100%;
        height: 100%;
    }
</style>
