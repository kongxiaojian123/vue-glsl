<template>
  <div id="app">
    <gl-canvas v-if="hasCanvas" @update="glslUpdate">
      <gl-program name="main" :code="shaderCode">
        <gl-float name="u_light" :value="light" />
      </gl-program>
    </gl-canvas>
  </div>
</template>

<script lang="ts">
const shader=`
void main() {
    vec2 uv = gl_FragCoord.xy/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    gl_FragColor = vec4(col*u_light,1.0);
}`;
export default {
  data(){
    return{
      light:0,
      shaderCode:shader,
      hasCanvas:true,
    }
  },
  methods:{
    glslUpdate(tickData){
      //console.log(tickData);
      this.light = (Math.sin(tickData.iTime)+1)/2;
    }
  }
};
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
