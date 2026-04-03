export const distortionFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform float u_k1;
uniform bool u_showGrid;
uniform vec2 u_resolution;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 distort(vec2 uv, float k1) {
  vec2 centered = uv - 0.5;
  float r2 = dot(centered, centered);
  vec2 distorted = centered * (1.0 + k1 * r2);
  return distorted + 0.5;
}

float grid(vec2 uv, float lineWidth) {
  vec2 gridUV = fract(uv * 10.0);
  vec2 edge = smoothstep(vec2(lineWidth), vec2(lineWidth * 2.0), gridUV)
            * smoothstep(vec2(lineWidth), vec2(lineWidth * 2.0), 1.0 - gridUV);
  return 1.0 - min(edge.x, edge.y);
}

void main() {
  vec2 distortedUV = distort(v_texCoord, u_k1);

  if (distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec2 sampleUV = vec2(distortedUV.x, 1.0 - distortedUV.y);
  fragColor = texture(u_image, sampleUV);

  if (u_showGrid) {
    float lineWidth = 1.5 / max(u_resolution.x, u_resolution.y) * 10.0;
    float g = grid(v_texCoord, lineWidth);
    fragColor = mix(fragColor, vec4(1.0, 1.0, 1.0, 1.0), g * 0.5);
  }
}
`
