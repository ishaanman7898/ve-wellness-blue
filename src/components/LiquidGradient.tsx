import { useEffect, useRef } from "react";

declare global {
  interface Window {
    THREE?: any;
  }
}

interface LiquidGradientProps {
  scheme?: number; // 1..5 from the provided CodePen schemes
}

export function LiquidGradient({ scheme = 1 }: LiquidGradientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let app: any;
    let destroyed = false;

    const ensureThree = () =>
      new Promise<void>((resolve, reject) => {
        if (window.THREE) return resolve();
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load three.js"));
        document.head.appendChild(script);
      });

    const init = async () => {
      await ensureThree();
      if (destroyed || !containerRef.current || !window.THREE) return;
      const THREE = window.THREE;

      class TouchTexture {
        size: number;
        width: number;
        height: number;
        maxAge: number;
        radius: number;
        speed: number;
        trail: any[];
        last: any;
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        texture: any;
        constructor() {
          this.size = 64;
          this.width = this.height = this.size;
          this.maxAge = 64;
          this.radius = 0.25 * this.size;
          this.speed = 1 / this.maxAge;
          this.trail = [];
          this.last = null;
          this.canvas = document.createElement("canvas");
          this.canvas.width = this.width;
          this.canvas.height = this.height;
          const ctx = this.canvas.getContext("2d");
          if (!ctx) throw new Error("2d ctx not available");
          this.ctx = ctx;
          this.ctx.fillStyle = "black";
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          this.texture = new THREE.Texture(this.canvas);
        }
        update() {
          this.clear();
          const speed = this.speed;
          for (let i = this.trail.length - 1; i >= 0; i--) {
            const point = this.trail[i];
            let f = point.force * speed * (1 - point.age / this.maxAge);
            point.x += point.vx * f;
            point.y += point.vy * f;
            point.age++;
            if (point.age > this.maxAge) {
              this.trail.splice(i, 1);
            } else {
              this.drawPoint(point);
            }
          }
          this.texture.needsUpdate = true;
        }
        clear() {
          this.ctx.fillStyle = "black";
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        addTouch(point: { x: number; y: number }) {
          let force = 0;
          let vx = 0;
          let vy = 0;
          const last = this.last;
          if (last) {
            const dx = point.x - last.x;
            const dy = point.y - last.y;
            if (dx === 0 && dy === 0) return;
            const dd = dx * dx + dy * dy;
            const d = Math.sqrt(dd);
            vx = dx / d;
            vy = dy / d;
            force = Math.min(dd * 20000, 2.0);
          }
          this.last = { x: point.x, y: point.y };
          this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
        }
        drawPoint(point: any) {
          const pos = {
            x: point.x * this.width,
            y: (1 - point.y) * this.height,
          };
          let intensity = 1;
          if (point.age < this.maxAge * 0.3) {
            intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
          } else {
            const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
            intensity = -t * (t - 2);
          }
          intensity *= point.force;
          const radius = this.radius;
          const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
          const offset = this.size * 5;
          this.ctx.shadowOffsetX = offset;
          this.ctx.shadowOffsetY = offset;
          this.ctx.shadowBlur = radius * 1;
          this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
          this.ctx.beginPath();
          this.ctx.fillStyle = "rgba(255,0,0,1)";
          this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      class GradientBackground {
        sceneManager: any;
        mesh: any;
        uniforms: any;
        constructor(sceneManager: any) {
          this.sceneManager = sceneManager;
          this.mesh = null;
          this.uniforms = {
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uColor1: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
            uColor2: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
            uColor3: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
            uColor4: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
            uColor5: { value: new THREE.Vector3(0.945, 0.353, 0.133) },
            uColor6: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
            uSpeed: { value: 1.2 },
            uIntensity: { value: 1.8 },
            uTouchTexture: { value: null },
            uGrainIntensity: { value: 0.08 },
            uZoom: { value: 1.0 },
            uDarkNavy: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
            uGradientSize: { value: 1.0 },
            uGradientCount: { value: 6.0 },
            uColor1Weight: { value: 1.0 },
            uColor2Weight: { value: 1.0 },
          };
        }
        init() {
          const { width, height } = this.sceneManager.getViewSize();
          const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
          const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vec3 pos = position.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
                vUv = uv;
              }
            `,
            fragmentShader: `
              uniform float uTime;
              uniform vec2 uResolution;
              uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3; uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6;
              uniform float uSpeed; uniform float uIntensity; uniform sampler2D uTouchTexture; uniform float uGrainIntensity; uniform float uZoom; uniform vec3 uDarkNavy; uniform float uGradientSize; uniform float uGradientCount; uniform float uColor1Weight; uniform float uColor2Weight;
              varying vec2 vUv; 
              float grain(vec2 uv, float time) {
                vec2 grainUv = uv * uResolution * 0.5;
                float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
                return grainValue * 2.0 - 1.0;
              }
              vec3 getGradientColor(vec2 uv, float time) {
                float gradientRadius = uGradientSize;
                vec2 center1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
                vec2 center2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
                vec2 center3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
                vec2 center4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
                vec2 center5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
                vec2 center6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);
                float dist1 = length(uv - center1); float dist2 = length(uv - center2); float dist3 = length(uv - center3); float dist4 = length(uv - center4); float dist5 = length(uv - center5); float dist6 = length(uv - center6);
                float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
                float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
                float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
                float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
                float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
                float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
                vec3 color = vec3(0.0);
                color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
                color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
                color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
                color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
                color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
                color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;
                float radialGradient1 = length((uv - 0.5));
                float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, radialGradient1);
                color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
                color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
                float luminance = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(luminance), color, 1.35);
                color = pow(color, vec3(0.92));
                float brightness1 = length(color);
                float mixFactor1 = max(brightness1 * 1.2, 0.15);
                color = mix(uDarkNavy, color, mixFactor1);
                float maxBrightness = 1.0;
                float brightness = length(color);
                if (brightness > maxBrightness) { color = color * (maxBrightness / brightness); }
                return color;
              }
              void main() {
                vec2 uv = vUv;
                vec4 touchTex = texture2D(uTouchTexture, uv);
                float vx = -(touchTex.r * 2.0 - 1.0);
                float vy = -(touchTex.g * 2.0 - 1.0);
                float intensity = touchTex.b;
                uv.x += vx * 0.8 * intensity; uv.y += vy * 0.8 * intensity;
                vec3 color = getGradientColor(uv, uTime);
                float grainValue = grain(uv, uTime);
                color += grainValue * uGrainIntensity;
                float timeShift = uTime * 0.5; color.r += sin(timeShift) * 0.02; color.g += cos(timeShift * 1.4) * 0.02; color.b += sin(timeShift * 1.2) * 0.02;
                float brightness2 = length(color); float mixFactor2 = max(brightness2 * 1.2, 0.15); color = mix(uDarkNavy, color, mixFactor2);
                color = clamp(color, vec3(0.0), vec3(1.0));
                float maxBrightness = 1.0; float brightness = length(color); if (brightness > maxBrightness) { color = color * (maxBrightness / brightness); }
                gl_FragColor = vec4(color, 1.0);
              }
            `,
            depthWrite: false,
          });
          this.mesh = new THREE.Mesh(geometry, material);
          this.mesh.position.z = 0;
          this.sceneManager.scene.add(this.mesh);
        }
        update(delta: number) {
          if (this.uniforms.uTime) this.uniforms.uTime.value += delta;
        }
        onResize(width: number, height: number) {
          const { width: w, height: h } = this.sceneManager.getViewSize();
          if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.geometry = new this.sceneManager.THREE.PlaneGeometry(w, h, 1, 1);
          }
          this.uniforms.uResolution.value.set(width, height);
        }
      }

      class App {
        container: HTMLElement;
        THREE: any;
        renderer: any;
        camera: any;
        scene: any;
        clock: any;
        touchTexture: any;
        gradientBackground: any;
        rafId: number | null = null;
        colorSchemes: any;
        constructor(container: HTMLElement) {
          this.container = container;
          this.THREE = THREE;
          this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          this.renderer.setAnimationLoop(null);
          this.container.appendChild(this.renderer.domElement);
          this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
          this.camera.position.z = 50;
          this.scene = new THREE.Scene();
          this.scene.background = new THREE.Color(0x0a0e27);
          this.clock = new THREE.Clock();
          this.touchTexture = new TouchTexture();
          this.gradientBackground = new GradientBackground(this);
          this.gradientBackground.uniforms.uTouchTexture.value = this.touchTexture.texture;
          this.colorSchemes = {
            // Scheme 1: Orange (#F15A22) + Blue (#2563EB)
            1: { color1: new THREE.Vector3(0.945, 0.353, 0.133), color2: new THREE.Vector3(0.145, 0.388, 0.922) },
            2: { color1: new THREE.Vector3(1.0, 0.424, 0.314), color2: new THREE.Vector3(0.251, 0.878, 0.816) },
            3: { color1: new THREE.Vector3(0.945, 0.353, 0.133), color2: new THREE.Vector3(0.039, 0.055, 0.153), color3: new THREE.Vector3(0.251, 0.878, 0.816) },
            4: { color1: new THREE.Vector3(0.949, 0.4, 0.2), color2: new THREE.Vector3(0.176, 0.42, 0.427), color3: new THREE.Vector3(0.82, 0.686, 0.612) },
            5: { color1: new THREE.Vector3(0.945, 0.353, 0.133), color2: new THREE.Vector3(0.0, 0.259, 0.22), color3: new THREE.Vector3(0.945, 0.353, 0.133), color4: new THREE.Vector3(0.0, 0.0, 0.0), color5: new THREE.Vector3(0.945, 0.353, 0.133), color6: new THREE.Vector3(0.0, 0.0, 0.0) },
          };
          this.init();
        }
        getViewSize() {
          const width = this.container.clientWidth || window.innerWidth;
          const height = this.container.clientHeight || window.innerHeight;
          const fovInRadians = (this.camera.fov * Math.PI) / 180;
          const viewHeight = Math.abs(this.camera.position.z * Math.tan(fovInRadians / 2) * 2);
          return { width: viewHeight * this.camera.aspect, height: viewHeight, containerWidth: width, containerHeight: height };
        }
        setColorScheme(s: number) {
          const colors = this.colorSchemes[s] || this.colorSchemes[1];
          const u = this.gradientBackground.uniforms;
          if (s === 3) {
            u.uColor1.value.copy(colors.color1); u.uColor2.value.copy(colors.color2); u.uColor3.value.copy(colors.color3);
            u.uColor4.value.copy(colors.color1); u.uColor5.value.copy(colors.color2); u.uColor6.value.copy(colors.color3);
          } else if (s === 4) {
            u.uColor1.value.copy(colors.color1); u.uColor2.value.copy(colors.color2); u.uColor3.value.copy(colors.color3);
            u.uColor4.value.copy(colors.color1); u.uColor5.value.copy(colors.color2); u.uColor6.value.copy(colors.color3);
          } else if (s === 5) {
            u.uColor1.value.copy(colors.color1); u.uColor2.value.copy(colors.color2); u.uColor3.value.copy(colors.color3);
            u.uColor4.value.copy(colors.color4); u.uColor5.value.copy(colors.color5); u.uColor6.value.copy(colors.color6);
          } else {
            u.uColor1.value.copy(colors.color1); u.uColor2.value.copy(colors.color2); u.uColor3.value.copy(colors.color1);
            u.uColor4.value.copy(colors.color2); u.uColor5.value.copy(colors.color1); u.uColor6.value.copy(colors.color2);
          }
          // Scheme 1 tuned settings
          if (s === 1 || s === 5 || s === 8) {
            this.scene.background = new THREE.Color(0x0a0e27);
            u.uDarkNavy.value.set(0.039, 0.055, 0.153);
            u.uGradientSize.value = 0.45;
            u.uGradientCount.value = 12.0;
            u.uSpeed.value = 1.5;
            // Emphasize orange + blue
            u.uColor1Weight.value = 1.0;
            u.uColor2Weight.value = 2.4;
          }
        }
        init() {
          this.gradientBackground.init();
          this.resize();
          this.setColorScheme(scheme);
          this.tick();
          window.addEventListener("resize", this.resize);
          window.addEventListener("mousemove", this.onMouseMove);
          window.addEventListener("touchmove", this.onTouchMove, { passive: true });
        }
        resize = () => {
          const w = this.container.clientWidth || window.innerWidth;
          const h = this.container.clientHeight || window.innerHeight;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
          this.gradientBackground.onResize(w, h);
        };
        onTouchMove = (ev: TouchEvent) => {
          const t = ev.touches[0];
          this.onMouseMove({ clientX: t.clientX, clientY: t.clientY } as any);
        };
        onMouseMove = (ev: { clientX: number; clientY: number }) => {
          const x = ev.clientX / (this.container.clientWidth || window.innerWidth);
          const y = 1 - ev.clientY / (this.container.clientHeight || window.innerHeight);
          this.touchTexture.addTouch({ x, y });
        };
        update(delta: number) {
          this.touchTexture.update();
          this.gradientBackground.update(delta);
        }
        render() {
          const delta = this.clock.getDelta();
          const clamped = Math.min(delta, 0.1);
          this.renderer.render(this.scene, this.camera);
          this.update(clamped);
        }
        tick = () => {
          this.render();
          this.rafId = requestAnimationFrame(this.tick);
        };
        destroy() {
          if (this.rafId) cancelAnimationFrame(this.rafId);
          window.removeEventListener("resize", this.resize);
          window.removeEventListener("mousemove", this.onMouseMove);
          window.removeEventListener("touchmove", this.onTouchMove);
          this.renderer.dispose();
          if (this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
          }
        }
      }

      app = new App(containerRef.current);
    };

    init();
    return () => {
      destroyed = true;
      if (app && app.destroy) app.destroy();
    };
  }, [scheme]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden />
  );
}
