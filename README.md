# vue-glsl

vue-glsl 是一个基于vue的片段着色器组件,使用的是webGL 1.0(移动端webGL 2.0不支持),并支持多webGLProgram项目。

组件支持[shadertoyCode](https://www.shadertoy.com/);

## Screenshots

![screenshot](https://go.163.com/web/20200115_poly/static/screenshot.jpg)

## Install and Usage

```bash
# install dependices
 `npm install`

# examples
`npm run serve`

# build component
`npm run build-lib`
```

<br>

## Quickstart
First, install vue-glsl using either npm.

```bash
npm i vue-glsl --save
```

Instanciate and tell Vue about the plugin

```javascript
import {createApp} from 'vue'
import glsl from 'vue-glsl'
import App from './App.vue'
createApp(App).use(glsl).mount('#app');
```

Then use the components !

```vue
<template>
  <div id="app">
    <gl-canvas @update="glslUpdate">
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
    }
  },
  methods:{
    glslUpdate(tickData: {
      iResolution: number[],
      iTime: number,
      iTimeDelta: number,
      iFrame: number,
      iMouse: number[],
      iDate: number[],
    }){
      //console.log(tickData);
      this.light = (Math.sin(tickData.iTime)+1)/2;
    }
  }
};
</script>
<style>
#app{
  position: absolute;
  top: 0;left: 0;
  padding: 0;margin: 0;
  width: 100%;height: 100%;
  background: #000;
  overflow: hidden;
}
</style>
```

## API

<details><summary><strong>gl-canvas</strong></summary>

  包含了`canvas`创建，以及webGL环境配置,当`gl-canvas`被销毁时，`requestAnimationFrame`也将被销毁。

  ---------------------------------

  | Props      | default  |  describe   |
  | :--------  | :-----:  |  :------------------------------------------------------ |
  | `width`    | `null`   |  用于设置`canvas`的宽度，不设置宽高会自动读取父级的宽高。    |
  | `height`   | `null`   |  用于设置`canvas`的高度，不设置宽高会自动读取父级的宽高。    |
  | `code`     | `''`     |  公共片段着色器代码，多`webGLProgram`时会自动拼接在每个`webGLProgram`的`fragmentShader`中。 |
  | `style`    | `''`     |  `clearColor`设置为透明的，如果想给`canvas`加一个背景的话，设置其样式就好了 |


  ---------------------------------
  #### 监听方法

  `update`:<br/>
  在每一次绘制时会触发该方法供vue做js操作,返回数据为当前帧的一些内置变量。<br/>
  ##### 用法：
  ```html
  <gl-canvas @update="canvasUpdate">
    <!-- ... -->
  </gl-canvas>
  <script lang="ts">
    export default{
      // ...
      methods:{
        canvasUpdate(tickData:{
          iResolution :number[];  // viewport resolution (in pixels)
          iTime       :number;    // shader playback time (in seconds)
          iTimeDelta  :number;    // render time (in seconds)
          iFrame      :number;    // shader playback frame
          iMouse      :number[];  // mouse pixel coords. xy: current (if MLB down), zw: click
          iDate       :number[];  // (year, month, day, time in seconds)
        }){
          // ...
        }
      }
    }
  </script>
  ```
</details>

<details><summary><strong>gl-program</strong></summary>

  webGLProgram的创建操作,必须是 `gl-canvas` 的子组件。

  ---------------------------------

  | Props      | default  |  describe   |
  | :--------  | :-----:  |  :------------------------------------------------------ |
  | `name`    | `'main'`   |  当有多个program时，此属性必须设置，用来区分`webGLProgram`和当作`frameBuffer`的`id`使用。    |
  | `code`     | `''`     |  当前`webGLProgram`的片段着色器代码，会自动拼接`gl-canvas`中的公共`code` |

  #### 用法：
  ```html
  <gl-canvas>
    <gl-program name="buffer0" :code="bufferCode0"></gl-program>
    <gl-program name="main" :code="mainCode"></gl-program>
  </gl-canvas>
  ```
</details>

### <strong>WebGLUniform组件</strong>

----------------------------------
<details><summary><strong>gl-int</strong></summary>

  `WebGLUniform`组件,当有`int`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number`   |  `int`类型的`WebGLUniform`数据    |

  #### 用法：
  ```html
  <gl-canvas>
    <gl-program name="main" :code="mainCode">
      <gl-int name="u_int0" :value="u_int0">
    </gl-program>
  </gl-canvas>
  <script>
    export default{
      data(){
        return{
          u_int0:0,
          mainCode:`
void main(){
  gl_FragColor = vec4(vec3(u_int0),1);
}
          `,
        }
      }
    }
  </script>
  ```
</details>


<details><summary><strong>gl-float</strong></summary>

  `WebGLUniform`组件,当有`float`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number`   |  `float`类型的`WebGLUniform`数据    |

  #### 用法：
  ```html
  <gl-canvas>
    <gl-program name="main" :code="mainCode">
      <gl-float name="u_float0" :value="u_float0">
    </gl-program>
  </gl-canvas>
  <script>
    export default{
      data(){
        return{
          u_float0:.5,
          mainCode:`
void main(){
  gl_FragColor = vec4(vec3(u_float0),1);
}
          `,
        }
      }
    }
  </script>
  ```
</details>

<details><summary><strong>gl-vec2</strong></summary>

  `WebGLUniform`组件,当有`vec2`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[2]`   |  `vec2`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`vec2`数据；
</details>
<details><summary><strong>gl-vec3</strong></summary>

  `WebGLUniform`组件,当有`vec3`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[3]`   |  `vec3`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`vec3`数据；
</details>
<details><summary><strong>gl-vec4</strong></summary>

  `WebGLUniform`组件,当有`vec4`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[4]`   |  `vec4`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`vec4`数据；
</details>
<details><summary><strong>gl-mat2</strong></summary>

  `WebGLUniform`组件,当有`mat2`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[4]`   |  `mat2`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`mat2`数据；
</details>
<details><summary><strong>gl-mat3</strong></summary>

  `WebGLUniform`组件,当有`mat3`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[9]`   |  `mat3`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`mat3`数据；
</details>
<details><summary><strong>gl-mat4</strong></summary>

  `WebGLUniform`组件,当有`mat4`类型的`uniform`传入时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `number[16]`   |  `mat4`类型的`WebGLUniform`数据    |

  #### 用法同上，类型为`mat4`数据；
</details>
<details><summary><strong>gl-image</strong></summary>

  `WebGLUniform`组件,当用到纹理时，用此组件,必须是 `gl-program` 的子组件。

  ---------------------------------

  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `name`    | `string`   |   `WebGLUniform`名字   |
  | `value`    | `imageURL\|imageObj\|videoObj\|webGLProgramName\|textureCubeData`   |  用于传入当前`WebGLProgram`纹理的数据   |
  | `repeat`    | `0\|1\|2`   |   可以省略，2d纹理有效,0(默认):`gl.CLAMP_TO_EDGE` 1:`gl.REPEAT` 2:`gl.MIRRORED_REPEAT`   |
  | `repeatX`    | `0\|1\|2`   |   同上，但是若有`repeat`会被其覆盖   |
  | `repeatY`    | `0\|1\|2`   |   同上，但是若有`repeat`会被其覆盖    |



  #### `value` 取值；

  `<string>imageURL`:本地图片链接地址。<br/>

  `<HTMLImageElement>imageObj|<HTMLVideoElement>videoObj`:可以传入`Image`对象或者`video`对象（`video`对象没测，但是理论上可以的），比如展示跨域`image`时，自行传入`image`对象，效果同`imageURL`;<br/>

  `<string>webGLProgramName`:当项目为多`WebGLProgram`时，`value`值可设置为`gl-program`的`name`值,可以把该`frameBuffer`引入纹理（除main`webGLProgram`外，其他`webGLProgram`均可当作纹理对象，原因是main`webGLProgram`要作为主`frameBuffer`渲染出来）;<br/>

  `<object>textureCubeData`:用于添加立方体贴图，并包含以下数据：<br/>
  | Props      | Type  |  describe   |
  | :--------  | :-----:  |  :----------- |
  | `front`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |
  | `back`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |
  | `left`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |
  | `right`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |
  | `top`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |
  | `bottom`    | `imageURL\|imageObj\|videoObj`   |   本地图片链接地址或者`Image\|Video`HTML对象，最好为2^n的正方形尺寸   |



  #### 用法：
  ```html
  <gl-canvas>
    <gl-program name="buffer0" :code="bufferCode0">
    </gl-program>
    <gl-program name="main" :code="mainCode">
      <gl-image name="u_image0" :value="u_image0">
      <gl-image name="u_image1" value="buffer0">
    </gl-program>
  </gl-canvas>
  <script>
    export default{
      data(){
        return{
          u_image0:require('../assets/image0.png'),
          //bufferCode0:...
          mainCode:`
void main(){
  vec2 uv = gl_FragCoord.xy/iResolution.xy;
  gl_FragColor = texture2D(u_image0,uv)+texture2D(u_image1,uv);
}
          `,
        }
      }
    }
  </script>
  ```

</details>

---------------------------------

<details><summary><strong>uniform内置变量</strong></summary>
  内支持变量(glsl中自动追加下列数据，供片段着色器直接使用)

| type      | name  |  describe   |
| :--------  | :-----  |  :----------- |
|  uniform vec3   |   iResolution;    |       // viewport resolution (in pixels)        |
|  uniform float  |   iTime;          |       // shader playback time (in seconds)        |
|  uniform float  |   iTimeDelta;     |       // render time (in seconds)        |
|  uniform int    |   iFrame;         |       // shader playback frame        |
|  uniform vec4   |   iMouse;         |       // mouse pixel coords. xy: current (if MLB down), zw: click        |
|  uniform vec4   |   iDate;          |       // (year, month, day, time in seconds)        |

#### 用法：

在`gl-image`示例中已经用到了`iResolution`;
</details>


