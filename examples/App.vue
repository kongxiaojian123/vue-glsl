<template>
  <div id="app">
    <gl-canvas @update="glslUpdate">
      <gl-program name="main" :code="shaderCode">

      </gl-program>
    </gl-canvas>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import glsl from '../packages/index';
Vue.use(glsl);
const shader=`
void main() {
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    gl_FragColor = vec4(col,1.0);
}`;
export default Vue.extend({
  data(){
    return{
      shaderCode:shader,
    }
  },
  methods:{
    glslUpdate(tickData){
      console.log(tickData);
    }
  }
});
</script>

<style>
html,body,#app{
  position: absolute;
  top: 0;left: 0;
  padding: 0;margin: 0;
  width: 100%;height: 100%;
  background: #000;
  overflow: hidden;
}
</style>
