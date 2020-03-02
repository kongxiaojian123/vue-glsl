/*
内支持变量(glsl中自动追加下列数据)
uniform vec3      iResolution;           // viewport resolution (in pixels)
uniform float     iTime;                 // shader playback time (in seconds)
uniform float     iTimeDelta;            // render time (in seconds)
uniform int       iFrame;                // shader playback frame
uniform float     iChannelTime[4];       // channel playback time (in seconds)
uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
uniform vec4      iDate;                 // (year, month, day, time in seconds)
————————————————————————————————————————————————————————————————————————————————
暂不支持变量
uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
*/
const VERTEX_SOURCE = `precision highp float;
precision highp int;
uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform vec4 iMouse;
uniform vec4 iDate;

attribute vec4 aPosition;

varying vec4 v_iResolution_iMouse_iDate[3];
varying float iChannelTime[4];
varying vec3 iChannelResolution[4];

void main() {
    gl_Position = aPosition;

    v_iResolution_iMouse_iDate[0] = vec4(iResolution,iTime);
    v_iResolution_iMouse_iDate[1] = vec4(iMouse.xyz,iTimeDelta);
    v_iResolution_iMouse_iDate[2] = iDate;
    iChannelTime[0] = iTime;
    iChannelTime[1] = iTime;
    iChannelTime[2] = iTime;
    iChannelTime[3] = iTime;
    iChannelResolution[0] = iResolution;
    iChannelResolution[1] = iResolution;
    iChannelResolution[2] = iResolution;
    iChannelResolution[3] = iResolution;
}`;
const requestAnimationFrame = webkitRequestAnimationFrame||window.requestAnimationFrame;
const cancelAnimationFrame = webkitCancelAnimationFrame||window.cancelAnimationFrame;
const dayTime = 24*60*60;
export type int = number;
export type float = number;
export interface vec2 extends Array<number>{
    0:number,
    1:number
}
export interface vec3 extends vec2{
    2:number
}
export interface vec4 extends vec3{
    3:number
}
export interface mat2 extends vec4{
}
export interface mat3 extends mat2{
    4:number;
    5:number;
    6:number;
    7:number;
    8:number;
}
export interface mat4 extends mat3{
    9:number;
    10:number;
    11:number;
    12:number;
    13:number;
    14:number;
    15:number;
}
export type samplerEle = HTMLImageElement|HTMLCanvasElement|HTMLVideoElement;
export type sampler2D = string|samplerEle;
export interface samplerCube{
    front:sampler2D,
    back:sampler2D,
    left:sampler2D,
    right:sampler2D,
    top:sampler2D,
    bottom:sampler2D,
};
export type uniformType = int|float|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube;
export interface ProgramStore{
    uniform:{
        [key:string]:{
            id:WebGLUniformLocation,
            type:string,
            value:uniformType,
            textureData?:{
                id:GLenum,
                repeatX:number,
                repeatY:number,
                texture:WebGLTexture,
                image?:samplerEle,
                imageCube?:{
                    front:samplerEle,
                    back:samplerEle,
                    left:samplerEle,
                    right:samplerEle,
                    top:samplerEle,
                    bottom:samplerEle,
                }
            }
        }
    },
    defaultLocation:{
        iResolution:WebGLUniformLocation,
        iTime:WebGLUniformLocation,
        iTimeDelta:WebGLUniformLocation,
        iFrame:WebGLUniformLocation,
        iMouse:WebGLUniformLocation,
        iDate:WebGLUniformLocation,
        aPosition:GLint,
    }
    fragShader:WebGLShader,
    fragCode:string,
    program:WebGLProgram,
    textureLen:number,
    frameBuffer?:WebGLFramebuffer,
    
    frameTexture?:WebGLTexture,
    cacheTexture?:WebGLTexture,
}
export default class ContextManager {
    private canvas:HTMLCanvasElement;
    private canvasRect:DOMRect;
    private gl:WebGLRenderingContext|WebGL2RenderingContext;
    private programStore:{[key:string]:ProgramStore};
    private _readyResolve:Function;
    private ready=new Promise(resolve=>{this._readyResolve=resolve});

    public onUpdate:Function;
    public iResolution:vec3;
    public iTime:number;
    public iTimeDelta:number;
    public iFrame:number;
    public iDate:vec4;
    public iMouse:vec4;

    private vertexBuffer:WebGLBuffer;
    private vertShader:WebGLShader;
    private initTime:number;
    private timer:number;
    private commonCode:string;
    private EXT_FLOAT:number;
    private EXT_LOD=null;
    private EXT_DERIVATIVES=null;
    private initVertex(){
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                -1.0, -1.0,
            ]),
            this.gl.STATIC_DRAW,
        );
    }
    public init(canvas:HTMLCanvasElement,canvasRect:DOMRect,commonCode:string){
        this.canvas = canvas;
        this.canvasRect = canvasRect;
        this.commonCode = commonCode;
        // 绝大部分移动端都不支持 所以直接用webGL 1.0 以及增加了一些webGL2.0的方法
        this.gl = canvas.getContext('webgl',{
            antialias:true,
            alpha:true,
        });
        this.setExtension();
        this.initVertex();

        this.iResolution = [this.gl.drawingBufferWidth,this.gl.drawingBufferHeight,0];
        this.iMouse=[0,0,0,0];
        this.resetTime();

        this.gl.clearColor(0,0,0,0);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL,true);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.initVertShader();
        this.setSize();
        this.event();
        this.autoRender();
        this._readyResolve();
    }
    private setExtension(){
        let extFloat = null;
        if(false&&navigator.platform.search(/win|mac/i)>=0){
            //移动端不支持 pc移动效果统一 跳过float支持
            //但是float 比 half_float更精准
            extFloat = this.gl.getExtension('OES_texture_float');
            this.gl.getExtension('OES_texture_float_linear');
        }
        const extHalfFloat = this.gl.getExtension('OES_texture_half_float');
        this.EXT_FLOAT = extFloat&&this.gl.FLOAT||extHalfFloat&&extHalfFloat.HALF_FLOAT_OES||this.gl.UNSIGNED_BYTE;
        this.gl.getExtension('OES_texture_half_float_linear');
        this.EXT_DERIVATIVES = this.gl.getExtension('OES_standard_derivatives');
        this.EXT_LOD = this.gl.getExtension('EXT_shader_texture_lod');
    }
    public setSize(){
        this.gl.viewport(0,0,this.iResolution[0],this.iResolution[1]);
    }
    public resetTime(){
        this.iTime = this.iTimeDelta = this.iFrame = 0;
        const currentTime = new Date();
        this.initTime = currentTime.getTime()/1000;
        this.iDate=[
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate(),
            this.initTime/1000%dayTime
        ];
    }
    private event(){
        const setMouse = (ev:MouseEvent|Touch)=>{
            this.iMouse[0]=(ev.pageX-this.canvasRect.left)*this.gl.drawingBufferWidth/this.canvasRect.width;
            this.iMouse[1]=(this.canvasRect.height-(ev.pageY-this.canvasRect.top))*this.gl.drawingBufferHeight/this.canvasRect.height;
        }
        this.canvas.addEventListener('touchstart',(ev:TouchEvent)=>{
            this.iMouse[2] = this.iMouse[3] = 1;
            setMouse(ev.touches[0]);
        },false);
        this.canvas.addEventListener('mousedown',(ev:MouseEvent)=>{
            this.iMouse[2] = this.iMouse[3] = 1;
            setMouse(ev);
        },false);
        this.canvas.addEventListener('touchmove',(ev:TouchEvent)=>{
            ev.stopPropagation();
            ev.preventDefault();
            setMouse(ev.touches[0]);
        },false);
        this.canvas.addEventListener('mousemove',setMouse,false);
        this.canvas.addEventListener('touchend',()=>{
            this.iMouse[2] = this.iMouse[3] = 0;
        },false);
        this.canvas.addEventListener('mouseup',()=>{
            this.iMouse[2] = this.iMouse[3] = 0;
        },false);
    }
    private autoRender(){
        const currentTime = new Date();
        const _time = currentTime.getTime()/1000;
        const playTime = _time-this.initTime;
        this.iTimeDelta = playTime - this.iTime;
        this.iTime = playTime;
        this.iDate=[
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate(),
            _time%dayTime
        ];
        this.iFrame++;
        this.render();
        this.timer = requestAnimationFrame(()=>{
            this.autoRender();
        });
    }
    public render(){
        Object.keys(this.programStore).forEach(programId=>{
            const programData = this.programStore[programId];
            const program = programData.program;
            if(!program) return;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,programData.frameBuffer||null);
            if(programId!=='main'){
                [programData.frameTexture,programData.cacheTexture] = [programData.cacheTexture,programData.frameTexture];
                this.gl.bindTexture(this.gl.TEXTURE_2D,programData.frameTexture);
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, programData.frameTexture, 0);
            }
            this.gl.useProgram(program);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            const aPosition = programData.defaultLocation.aPosition;
            this.gl.vertexAttribPointer(aPosition,2,this.gl.FLOAT,false,0,0);
            this.gl.enableVertexAttribArray(aPosition);
            this.gl.uniform3fv(programData.defaultLocation.iResolution,this.iResolution);
            this.gl.uniform1f(programData.defaultLocation.iTime,this.iTime);
            this.gl.uniform1f(programData.defaultLocation.iTimeDelta,this.iTimeDelta);
            this.gl.uniform1i(programData.defaultLocation.iFrame,this.iFrame);
            this.gl.uniform4fv(programData.defaultLocation.iMouse,this.iMouse);
            this.gl.uniform4fv(programData.defaultLocation.iDate,this.iDate);

            Object.values(programData.uniform).forEach(uniform=>{
                switch(uniform.type){
                    case 'int':
                        this.gl.uniform1i(uniform.id,<number>uniform.value);
                    break;
                    case 'float':
                        this.gl.uniform1f(uniform.id,<number>uniform.value);
                    break;
                    case 'vec2':
                        this.gl.uniform2fv(uniform.id,<vec2>uniform.value);
                    break;
                    case 'vec3':
                        this.gl.uniform3fv(uniform.id,<vec3>uniform.value);
                    break;
                    case 'vec4':
                        this.gl.uniform4fv(uniform.id,<vec4>uniform.value);
                    break;
                    case 'mat2':
                        this.gl.uniformMatrix2fv(uniform.id,false,<mat2>uniform.value);
                    break;
                    case 'mat3':
                        this.gl.uniformMatrix3fv(uniform.id,false,<mat3>uniform.value);
                    break;
                    case 'mat4':
                        this.gl.uniformMatrix4fv(uniform.id,false,<mat4>uniform.value);
                    break;
                    case 'sampler2D':{
                        if(uniform.textureData){
                            const textureData = uniform.textureData;
                            this.gl.activeTexture(this.gl.TEXTURE0+textureData.id);
                            this.gl.uniform1i(uniform.id,textureData.id);
                            if(textureData.image){
                                this.gl.bindTexture(this.gl.TEXTURE_2D,textureData.texture);
                            }else if(this.programStore[<string>uniform.value]){
                                //framebuffer
                                const repeatMode = [this.gl.CLAMP_TO_EDGE,this.gl.REPEAT,this.gl.MIRRORED_REPEAT];
                                const texture = this.programStore[<string>uniform.value].cacheTexture;
                                this.gl.bindTexture(this.gl.TEXTURE_2D,texture);
                                this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,repeatMode[textureData.repeatX]);
                                this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,repeatMode[textureData.repeatY]);
                            }
                        }
                        break;
                    }
                    case 'samplerCube':{
                        if(uniform.textureData){
                            const textureData = uniform.textureData;
                            this.gl.activeTexture(this.gl.TEXTURE0+textureData.id);
                            this.gl.uniform1i(uniform.id,textureData.id);
                            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP,textureData.texture);
                        }
                        break;
                    }
                }
            });
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        });
        this.onUpdate&&this.onUpdate();
    }
    public destroy(){
        cancelAnimationFrame(this.timer);
        Object.values(this.programStore).forEach(programData=>{
            this.gl.deleteProgram(programData.program);
            this.gl.deleteShader(programData.fragShader);
            programData.fragShader = null;
            programData.program = null;
        });
        this.programStore = null;
        this.gl.deleteBuffer(this.vertexBuffer);
        this.vertexBuffer = null;
        this.gl.deleteShader(this.vertShader);
        this.vertexBuffer = null;
    }
    public initUniform(programId:string,name:string,type:string,value:uniformType,repeatX?:number,repeatY?:number){
        const uniformList = this.programStore[programId].uniform;
        if(uniformList[name]){
            throw new Error(`Multiple registration uniform: ${name}`);
        }else{
            uniformList[name] = {
                id:null,
                type:type,
                value:value,
            };
            if(type==='sampler2D'){
                uniformList[name].textureData={
                    id:this.programStore[programId].textureLen++,
                    texture:null,
                    repeatX:repeatX,
                    repeatY:repeatY,
                }
            }
            if(type==='samplerCube'){
                uniformList[name].textureData={
                    id:this.programStore[programId].textureLen++,
                    texture:null,
                    repeatX:0,
                    repeatY:0,
                }
            }
        }
    }
    private initTexture(program:WebGLProgram,texture:WebGLTexture,image:samplerEle,activeId:number,textureType:number,texture2D:number,repeatX:number,repeatY:number){
        this.gl.useProgram(program);
        this.gl.activeTexture(this.gl.TEXTURE0+activeId);
        this.gl.bindTexture(textureType,texture);
        this.gl.texImage2D(texture2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,image);
        const width = (<HTMLImageElement>image).naturalWidth||(<HTMLVideoElement>image).videoWidth||(<HTMLCanvasElement>image).width;
        const height = (<HTMLImageElement>image).naturalHeight||(<HTMLVideoElement>image).videoHeight||(<HTMLCanvasElement>image).height;
        if((width & (width - 1)) === 0&&(height & (height - 1)) === 0){
            this.gl.generateMipmap(textureType);
        }else{
            this.gl.texParameteri(textureType,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR);
            // this.gl.texParameteri(textureType,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR);
        }
        this.gl.texParameteri(textureType,this.gl.TEXTURE_WRAP_S,repeatX);
        this.gl.texParameteri(textureType,this.gl.TEXTURE_WRAP_T,repeatY);
    }
    public setUniform(programId:string,name:string,value:uniformType,repeatX?:number,repeatY?:number){
        const programData = this.programStore[programId];
        if(!programData.program) return;
        const uniform = programData.uniform[name];
        uniform.value = value;
        this.gl.useProgram(programData.program);
        if(uniform.id===null){
            uniform.id=this.gl.getUniformLocation(programData.program,name);
        }
        if(uniform.type==='sampler2D'){
            const textureData = uniform.textureData;
            const repeatMode = [this.gl.CLAMP_TO_EDGE,this.gl.REPEAT,this.gl.MIRRORED_REPEAT];
            if(!textureData.texture){
                textureData.texture = this.gl.createTexture();
            }
            if(typeof uniform.value === 'string' && (<string>uniform.value).search(/\.(jpg|png)$|^data\:image/)>=0){
                if((!textureData.image)||((<HTMLImageElement>textureData.image).src||'').indexOf(<string>uniform.value)<0){
                    textureData.image = new Image();
                    textureData.image.onload = ()=>{
                        if(repeatX!==undefined) textureData.repeatX = repeatX;
                        if(repeatY!==undefined) textureData.repeatY = repeatY;
                        this.initTexture(
                            programData.program,
                            textureData.texture,
                            textureData.image,
                            textureData.id,
                            this.gl.TEXTURE_2D,
                            this.gl.TEXTURE_2D,
                            repeatMode[textureData.repeatX],
                            repeatMode[textureData.repeatY]
                        );
                    }
                    textureData.image.src = <string>uniform.value;
                }
            }else if(uniform.value instanceof HTMLElement){
                textureData.image = <samplerEle>value;
                if(repeatX!==undefined) textureData.repeatX = repeatX;
                if(repeatY!==undefined) textureData.repeatY = repeatY;
                this.initTexture(
                    programData.program,
                    textureData.texture,
                    textureData.image,
                    textureData.id,
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_2D,
                    repeatMode[textureData.repeatX],
                    repeatMode[textureData.repeatY]
                );
            }
            if(repeatX!==undefined&&repeatY!==undefined&&(textureData.repeatX !== repeatX||textureData.repeatY !== repeatY)){
                textureData.repeatX = repeatX;
                textureData.repeatY = repeatY;
                this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,repeatMode[textureData.repeatX]);
                this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,repeatMode[textureData.repeatY]);
            }
        }
        if(uniform.type==='samplerCube'){
                const repeatMode = [this.gl.CLAMP_TO_EDGE,this.gl.REPEAT,this.gl.MIRRORED_REPEAT];
                const textureCubeTarget={
                    front:this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                    back:this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                    left:this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    right:this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    top:this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    bottom:this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                };
                const textureData = uniform.textureData;
                if(!textureData.texture){
                    textureData.texture = this.gl.createTexture();
                }
                if(!textureData.imageCube){
                    textureData.imageCube = {
                        front:null,
                        back:null,
                        left:null,
                        right:null,
                        top:null,
                        bottom:null,
                    };
                }
                Object.keys(textureData.imageCube).forEach(imgId=>{
                    if(typeof uniform.value[imgId] === 'string'){
                        textureData.imageCube[imgId] = new Image();
                        const image = textureData.imageCube[imgId];
                        image.onload=()=>{
                            this.initTexture(
                                programData.program,
                                textureData.texture,
                                image,
                                textureData.id,
                                this.gl.TEXTURE_CUBE_MAP,
                                textureCubeTarget[imgId],
                                repeatMode[textureData.repeatX],
                                repeatMode[textureData.repeatY]
                            );
                        }
                        image.src = uniform.value[imgId];
                    }else{
                        textureData.imageCube[imgId] = uniform.value[imgId];
                        const image = textureData.imageCube[imgId];
                        this.initTexture(
                            programData.program,
                            textureData.texture,
                            image,
                            textureData.id,
                            this.gl.TEXTURE_CUBE_MAP,
                            textureCubeTarget[imgId],
                            repeatMode[textureData.repeatX],
                            repeatMode[textureData.repeatY]
                        );
                    }
                });
        }
    }
    public initProgram(programId:string,fragCode:string){
        if(!this.programStore)this.programStore = {};
        if(this.programStore[programId]){
            throw new Error(`Multiple registration program: ${programId}`);
        }else{
            this.programStore[programId]={
                uniform:{},
                defaultLocation:{
                    iResolution:null,
                    iTime:null,
                    iTimeDelta:null,
                    iFrame:null,
                    iMouse:null,
                    iDate:null,
                    aPosition:null,
                },
                fragShader:null,
                fragCode:fragCode,
                program:null,
                textureLen:0,
            };
        }
    }
    private initVertShader(){
        if(this.vertShader){
            this.gl.deleteShader(this.vertShader);
        }
        this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(this.vertShader,VERTEX_SOURCE);
        this.gl.compileShader(this.vertShader);
        if(!this.gl.getShaderParameter(this.vertShader,this.gl.COMPILE_STATUS)){
            let line = 1;
            const shader = this.vertShader;
            console.log((line+'\t|'+this.gl.getShaderSource(shader)).replace(/\n/g,()=>{
                return `\n${++line}\t|`;
            }));
            throw new Error(`VertShaderError: \n\t${this.gl.getShaderInfoLog(this.vertShader)}\n`);
        }
    }
    private initFragShader(programId:string){
        const programData = this.programStore[programId];
        if(programData.fragShader){
            this.gl.deleteShader(programData.fragShader);
        }
        programData.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        const fragCode = this.initFragCode(programData);
        this.gl.shaderSource(programData.fragShader,fragCode);
        this.gl.compileShader(programData.fragShader);
        if(!this.gl.getShaderParameter(programData.fragShader,this.gl.COMPILE_STATUS)){
            let line = 1;
            const shader = programData.fragShader;
            console.log((line+'\t|'+this.gl.getShaderSource(shader)).replace(/\n/g,()=>{
                return `\n${++line}\t|`;
            }));
            throw new Error(`fragShaderError(${programId}): \n\t${this.gl.getShaderInfoLog(programData.fragShader)}`);
        }
    }
    private initFragCode(programData:ProgramStore):string{
        let code = (this.commonCode||'')+'\n'+programData.fragCode;
        code = code.replace(/precision[a-zA-Z0-9 ]+;|uniform[^;];/g,'');
        let uniformStr='';
        Object.keys(programData.uniform).forEach(key=>{
            uniformStr+=`uniform ${programData.uniform[key].type} ${key};\n`;
        });
        //uniform 改成varying 为了减少uniform的数量 
        let ext = '';
        if(this.EXT_DERIVATIVES){
            ext +='#ifdef GL_OES_standard_derivatives\n    #extension GL_OES_standard_derivatives : enable\n#endif\n';
        }
        if(this.EXT_LOD){
            ext +='#extension GL_EXT_shader_texture_lod : enable\n';
        }
        console.log(ext);
        code = ext+`#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_shader_texture_lod : enable
precision highp float;
precision highp int;
uniform int iFrame;
varying vec4 v_iResolution_iMouse_iDate[3];
varying float iChannelTime[4];
varying vec3 iChannelResolution[4];

#define v_iResolution v_iResolution_iMouse_iDate[0]
#define v_iMouse v_iResolution_iMouse_iDate[1]
#define v_iDate v_iResolution_iMouse_iDate[2]
#define iResolution v_iResolution.xyz
#define iTime v_iResolution.w
#define iTimeDelta v_iMouse.w
#define iMouse v_iMouse.xyzz
#define iDate v_iDate

//webGL2 type
#define uint int
#define uvec2 ivec2
#define uvec3 ivec3
#define uvec4 ivec4

//math function
#define round(x) floor(x + 0.5)
float trunc( float x, float n ) { return floor(x*n)/n; }
mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }
float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}
mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }
mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}
float sinh(float x)  { return (exp(x)-exp(-x))/2.; }
float cosh(float x)  { return (exp(x)+exp(-x))/2.; }
float tanh(float x)  { return sinh(x)/cosh(x); }
float coth(float x)  { return cosh(x)/sinh(x); }
float sech(float x)  { return 1./cosh(x); }
float csch(float x)  { return 1./sinh(x); }
float asinh(float x) { return    log(x+sqrt(x*x+1.)); }
float acosh(float x) { return    log(x+sqrt(x*x-1.)); }
float atanh(float x) { return .5*log((1.+x)/(1.-x)); }
float acoth(float x) { return .5*log((x+1.)/(x-1.)); }
float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }
float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }

//texture function
vec4 texture(sampler2D sampler, vec2 coord, float bias){
    return texture2D(sampler, coord, bias);
}
vec4 texture(sampler2D sampler, vec2 coord){
    return texture2D(sampler, coord);
}
vec4 texture(sampler2D sampler, vec3 coord, float bias){
    return texture(sampler, coord.xy, bias);
}
vec4 texture(sampler2D sampler, vec3 coord){
    return texture(sampler, coord.xy);
}
vec4 texture(samplerCube sampler, vec3 coord, float bias){
    return textureCube(sampler, -coord, bias);
}
vec4 texture(samplerCube sampler, vec3 coord){
    return textureCube(sampler, -coord);
}

${this.EXT_LOD?"#define textureLod texture2DLodEXT\n#define textureGrad texture2DGradEXT\n":""}

vec4 texelFetch(sampler2D sampler, ivec2 coord, int bias){
    return textureLod(sampler, vec2(coord)/iResolution.xy, float(bias));
}

`+uniformStr+ code;
        if(code.search(/void\s+main\s*\(/)<0){
            code+=`
            
void main(){
    gl_FragColor = vec4(1);
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;
        }
        return code;
    }
    public async updateProgram(programId:string){
        await this.ready;
        const programData = this.programStore[programId];
        if(programData.program){
            this.gl.deleteProgram(programData.program);
        }
        this.initFragShader(programId);
        const program = this.gl.createProgram();
        programData.program = program;
        this.gl.attachShader(program,this.vertShader);
        this.gl.attachShader(program,programData.fragShader);
        this.gl.linkProgram(program);
        if(!this.gl.getProgramParameter(program,this.gl.LINK_STATUS)){
            throw new Error(`ProgramError(${programId}): \n\t${this.gl.getProgramInfoLog(program)}`);
        }
        if(programId!='main'){
            programData.frameTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, programData.frameTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                this.iResolution[0], this.iResolution[1], 0,
                this.gl.RGBA, this.EXT_FLOAT, null);
            this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.NEAREST);

            programData.cacheTexture = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, programData.cacheTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                this.iResolution[0], this.iResolution[1], 0,
                this.gl.RGBA, this.EXT_FLOAT, null);
            this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.NEAREST);
            
            programData.frameBuffer = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, programData.frameBuffer);
        }
        Object.keys(programData.uniform).forEach(key=>{
            this.setUniform(programId,key,programData.uniform[key].value);
        });
        Object.keys(programData.defaultLocation).forEach(key=>{
            switch(key){
                case 'aPosition':
                    programData.defaultLocation[key]=this.gl.getAttribLocation(program,key);
                break;
                default:
                    programData.defaultLocation[key]=this.gl.getUniformLocation(program,key);
            }
        });
    }
}