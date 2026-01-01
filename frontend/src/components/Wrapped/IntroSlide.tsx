import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

function PixelNoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uPixelRatio;

      // Simplex 2D noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        // High pixel size for the pixel art look
        float pixelSize = 6.0 * uPixelRatio; 
        vec2 st = gl_FragCoord.xy;
        
        vec2 pixelatedUV = floor(st / pixelSize) * pixelSize;
        vec2 uv = pixelatedUV / uResolution.xy;
        
        // Complex noise layers
        float n = snoise(uv * 3.0 + uTime * 0.1) * 0.5 + 0.5;
        n += snoise(uv * 6.0 - uTime * 0.05) * 0.25;
        
        float levels = 5.0;
        float quantized = floor(n * levels) / levels;
        
        // Pixel art color palette
        vec3 colorA = vec3(0.02, 0.05, 0.15); // Dark Navy
        vec3 colorB = vec3(0.15, 0.2, 0.5);   // Slate Blue
        vec3 colorC = vec3(0.4, 0.7, 0.9);   // Sky Blue
        
        vec3 finalColor = mix(colorA, colorB, smoothstep(0.0, 0.5, quantized));
        finalColor = mix(finalColor, colorC, smoothstep(0.5, 1.0, quantized));
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram();
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!program || !vertexShader || !fragmentShader) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "uTime");
    const resLoc = gl.getUniformLocation(program, "uResolution");
    const pixelRatioLoc = gl.getUniformLocation(program, "uPixelRatio");

    let animationFrameId: number;

    const render = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, width, height);
      gl.uniform1f(pixelRatioLoc, dpr);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    gl["useProgram"](program);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-5 h-full w-full bg-black"
    />
  );
}

interface IntroSlideProps {
  setStarted: (started: boolean) => void;
}

export default function IntroSlide({ setStarted }: IntroSlideProps) {
  function handleStart() {
    if (setStarted) setStarted(true);
    try {
      document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error attempting to enable full-screen mode:", err);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="relative w-full h-dvh md:h-[calc(100dvh-3rem)] max-w-md mx-auto">
        <div className="w-full h-dvh md:h-[calc(100dvh-3rem)] bg-white/20 md:rounded-lg overflow-hidden md:outline-2 md:outline-[#1C4D8D]/20 md:shadow-lg md:shadow-[#1C4D8D]/20">
          <div className="relative w-full h-full flex flex-col items-center justify-center px-6 text-center text-white">
            <PixelNoiseBackground />
            <div className="z-10 absolute inset-0 bg-black/30"></div>
            <div className="z-10">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter z-20">
                Welcome to Your Wrapped 2025
              </h1>
              <p className="mt-6 text-lg md:text-xl font-mono opacity-90 z-20">
                A look back at your coding journey this year
              </p>

              <button
                onClick={handleStart}
                className="z-30 mt-16 md:m-0 md:mt-16 bg-white text-[#1C4D8D] text-center text-lg font-black py-2 px-4 rounded-lg hover:bg-gray-200 transition"
              >
                Let's go{" "}
                <ArrowRight
                  className="inline-block p-0 m-0"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
