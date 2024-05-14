#version 300 es
precision highp float;

uniform sampler2D uBackBuffer;
uniform vec2 uResolution;
uniform int uFrame;
uniform vec2 uMouse;
uniform float uSpeed;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 uv = vUv, asp = uResolution / min(uResolution.x, uResolution.y), suv = uv * 2.0 - 1.0;
  vec2 cell = 1.0 / uResolution;

  vec4 center = texture(uBackBuffer, uv);
  vec4 px = texture(uBackBuffer, uv + vec2(1, 0) * cell);
  vec4 nx = texture(uBackBuffer, uv - vec2(1, 0) * cell);
  vec4 py = texture(uBackBuffer, uv + vec2(0, 1) * cell);
  vec4 ny = texture(uBackBuffer, uv - vec2(0, 1) * cell);

  float acc = px.x + nx.x + py.x + ny.x - 4.0 * center.x;
  acc *= 0.5;

  float velo = center.y + acc;
  velo *= 0.99;

  float height = center.x + velo;
  float dist = max(1.0 - distance(suv * asp, uMouse * asp) * 30.0, 0.0);
  height += dist * uSpeed * 2.0;

  outColor = vec4(height, velo, center.x, 0.0);
}