
import GlCanvas from './GlCanvas.vue';
import GlProgram from './GlProgram.vue';
import {GlInt,GlFloat,GlVec2,GlVec3,GlVec4,GlMat2,GlMat3,GlMat4,GlTexture} from './GlUniform';
import { App } from 'vue'
export default function(Vue:App){
    Vue.component('gl-canvas', GlCanvas);
    Vue.component('gl-program', GlProgram);
    Vue.component('gl-int', GlInt);
    Vue.component('gl-float', GlFloat);
    Vue.component('gl-vec2', GlVec2);
    Vue.component('gl-vec3', GlVec3);
    Vue.component('gl-vec4', GlVec4);
    Vue.component('gl-mat2', GlMat2);
    Vue.component('gl-mat3', GlMat3);
    Vue.component('gl-mat4', GlMat4);
    Vue.component('gl-image', GlTexture);
}