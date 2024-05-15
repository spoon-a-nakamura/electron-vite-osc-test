#version 300 es

in vec3 position;
in vec2 simUv;

uniform sampler2D uSim;

out float vAlpha;

void main() {
  vec4 sim = texture(uSim, simUv);
  vAlpha = sim.z - 1.0;

  gl_PointSize = 3.0;
  gl_Position = vec4(sim.xy, 0.0, 1.0);
}