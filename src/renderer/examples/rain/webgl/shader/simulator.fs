#version 300 es
precision highp float;

uniform sampler2D uBackBuffer;
uniform vec2 uResolution;
uniform int uFrame;
uniform float uDeltaTime;
uniform vec2 uMouse;

in vec2 vUv;
out vec4 outColor;

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(.1, .2, .3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

void main() {
  vec2 uv = vUv, asp = uResolution / min(uResolution.x, uResolution.y), suv = uv * 2.0 - 1.0;

  if (uFrame == 1) {
    vec3 h = hash(vec3(suv, 0.1));
    vec2 pos = h.xy * 2.0 - 1.0;
    outColor = vec4(pos, h.z + 1.0, 0.0);
    return;
  }

  vec4 b = texture(uBackBuffer, uv);
  vec2 pos = b.xy;
  float speed = b.z;
  pos.y -= uDeltaTime * speed * 0.4;

  if (0.02 < hash(vec3(uv, 0.1)).x) {
    vec2 mouse = uMouse * asp;
    float dist = distance(pos * asp, mouse);
    float power = smoothstep(0.15, 0.1, dist);
    vec2 dir1 = normalize(vec2(0, -1)); // 落下方向
    vec2 dir2 = normalize(mouse - pos * asp);
    float D1D2 = max(0.0, dot(dir1, dir2));
    vec2 dir = sign(dir2);
    if (dir.x == 0.0) dir.x = 1.0;
    pos += -dir * power * D1D2 * vec2(0.01, 0.05);
  }


  if (pos.y < -1.0) {
    vec3 h = hash(vec3(suv, 0.1));
    pos.x = h.x * 2.0 - 1.0;
    pos.y = 1.0 + h.y * 0.5;
  }  

  outColor = vec4(pos, speed, 0.0);
}