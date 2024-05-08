#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"


vec2 random2D(vec2 uv){	
    uv = vec2( dot(uv, vec2(127.1,311.7) ),
               dot(uv, vec2(269.5,183.3) ) );
    return -1.0 + 2.0 * fract(sin(uv) * 43758.5453123);
}


void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = sourceUV;
    uv *= 7.;
    // Tie varying pixel color
    vec2 col = random2D(uv);
    vec2 gridIndex = floor(uv); 
	vec2 gridFract = fract(uv);
	vec2 br = gridIndex + vec2(1.0, 0.0);
    
	vec2 gradBL = random2D(br); 

	vec2 distToPixelFromBR = gridFract - vec2(1.0, 0.0);
    

    float dotBL = dot(gradBL, distToPixelFromBR);

    float v = (dotBL + 1.)/2.;
    outColor = vec4(v,v,v,1.);
}