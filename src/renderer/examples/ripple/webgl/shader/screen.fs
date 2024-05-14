#version 300 es
precision highp float;

uniform sampler2D uImage;
uniform vec2 uCoveredScale;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 coveredUv = (vUv - 0.5) * uCoveredScale + 0.5;
  vec4 img = texture(uImage, coveredUv);
  outColor = img;
}