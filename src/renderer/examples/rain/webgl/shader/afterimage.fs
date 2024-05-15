#version 300 es
precision highp float;

uniform sampler2D uSource;
uniform sampler2D uBackBuffer;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 src = texture(uSource, vUv);
  vec4 b = texture(uBackBuffer, vUv);
  vec4 col = mix(b, src, 0.6);
  outColor = col;
}