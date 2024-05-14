#version 300 es
precision highp float;

uniform sampler2D uSim;
uniform sampler2D uImage;
uniform vec2 uCoveredScale;
uniform vec2 uResolution;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 cell = 1.0 / uResolution;

  float py = texture(uSim, vUv + vec2(0.0, 1.0) * cell).x;
  float ny = texture(uSim, vUv - vec2(0.0, 1.0) * cell).x;
  float px = texture(uSim, vUv + vec2(1.0, 0.0) * cell).x;
  float nx = texture(uSim, vUv - vec2(1.0, 0.0) * cell).x;

  vec3 tangent = normalize(vec3(0.0, cell.y * 2.0, py - ny));
  vec3 bitangent = normalize(vec3(cell.x * 2.0, 0.0, px - nx));
  vec3 normal = normalize(cross(bitangent, tangent));

  vec4 sim = texture(uSim, vUv);
  float dH = abs(sim.x - sim.z);

  vec2 coveredUv = (vUv - 0.5) * uCoveredScale + 0.5;
  vec3 col;
  col.r = texture(uImage, coveredUv - normal.xy * dH * 1.0).r;
  col.g = texture(uImage, coveredUv - normal.xy * dH * 1.1).g;
  col.b = texture(uImage, coveredUv - normal.xy * dH * 1.2).b;

  // outColor = vec4(normal * dH, 1.0);
  outColor = vec4(col, 1.0);
}