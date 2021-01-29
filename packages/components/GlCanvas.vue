<template>
    <canvas ref="canvas">
        <slot/>
    </canvas>
</template>
<script lang="ts">
    import ContextManager from './ContextManager';
    export default {
        provide(){
            return{
                glContext:new ContextManager(),
            }
        },
        props:{
            width:{
                type:Number,
                default:null,
            },
            height:{
                type:Number,
                default:null,
            },
            code:{
                type:String,
                default:'',
            }
        },
        data(){
            return{
                canvasRect:null,
            }
        },
        methods:{
            setSize(){
                const canvas = <HTMLCanvasElement>this.$refs.canvas;
                const parentElement = <HTMLElement>canvas.parentElement;
                canvas.width = this.width||parentElement.clientWidth;
                canvas.height = this.height||parentElement.clientHeight;
                this.canvasRect = canvas.getBoundingClientRect();
                const glContext = this._provided.glContext;
                glContext.init(canvas,this.canvasRect,this.code);
                glContext.onUpdate=()=>{
                    this.$emit('update',{
                        iResolution:[...glContext.iResolution],
                        iTime:glContext.iTime,
                        iTimeDelta:glContext.iTimeDelta,
                        iFrame:glContext.iFrame,
                        iMouse:[...glContext.iMouse],
                        iDate:[...glContext.iDate],
                    });
                };
            }
        },
        mounted(){
            this.setSize();
        },
        unmounted(){
            this._provided.glContext.destroy();
        }
    };
</script>
<style scoped>
    canvas{
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
