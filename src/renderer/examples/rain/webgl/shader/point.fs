#version 300 es
precision highp float;

in float vAlpha;
out vec4 outColor;

void main() {
  if (bool(step(1.0, length(gl_PointCoord * 2.0 - 1.0)))) {
    discard;
  }

  outColor = vec4(1, 1, 1, vAlpha * 0.2);
}