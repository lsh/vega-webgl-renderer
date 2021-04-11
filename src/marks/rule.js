import {color} from 'd3-color';
import {
  createProgramInfo,
  setUniforms,
  createBufferInfoFromArrays,
  createVertexArrayInfo,
  setBuffersAndAttributes,
  drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

const vs = `
    attribute vec2 position;
    attribute vec2 center;
    attribute vec2 scale;
    attribute vec4 color;
    uniform vec2 resolution;
    uniform vec2 origin;
    varying vec4 stroke;

    void main() {
      stroke = color;
      vec2 pos = position * scale;
      pos += origin;
      pos += center;
      pos /= resolution;
      pos.y = 1.0-pos.y;
      pos = pos*2.0-1.0;
      gl_Position = vec4(pos, 0, 1);
    }
`;

const fs = `
    precision mediump float;
    varying vec4 stroke;
    void main() {
      gl_FragColor = vec4(stroke.xyz, stroke.w);
    }
`;

function draw(gl, item) {
  const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  const itemCount = item.items.length;
  const centers = [];
  const scales = [];
  const colors = [];
  for (let i = 0; i < itemCount; i++) {
    const {x, y, x2, y2, stroke, strokeOpacity, strokeWidth} = item.items[i];
    centers.push(x, y);
    const col = color(stroke);
    const dx = x2 ? x2 : x;
    const dy = y2 ? y2 : y;
    colors.push(col.r / 255, col.g / 255, col.b / 255, strokeOpacity ?? 1);
    const ax = Math.abs(dx - x);
    const ay = Math.abs(dy - y);
    const sw = strokeWidth ? strokeWidth : 1;
    scales.push(ax ? ax : sw, ay ? ay : sw);
  }
  const programInfo = createProgramInfo(gl, [vs, fs]);
  gl.useProgram(programInfo.program);
  const buffer = {
    position: {data: positions},
    center: {data: centers, numComponents: 2, divisor: 1},
    scale: {data: scales, numComponents: 2, divisor: 1},
    color: {data: colors, numComponents: 4, divisor: 1}
  };
  setUniforms(programInfo, this.uniforms);
  const bufferInfo = createBufferInfoFromArrays(gl, buffer);
  const vertexInfo = createVertexArrayInfo(gl, programInfo, bufferInfo);
  setBuffersAndAttributes(gl, programInfo, vertexInfo);
  drawBufferInfo(gl, vertexInfo, gl.TRIANGLES, vertexInfo.numElements, 0, itemCount);
}

export default {
  type: 'rule',
  draw: draw,
};
