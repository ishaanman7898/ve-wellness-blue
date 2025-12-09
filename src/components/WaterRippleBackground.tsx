import { useEffect, useRef } from "react";

declare global {
  interface Window { THREE?: any }
}

export default function WaterRippleBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let destroyed = false;
    let app: any = null;

    const ensureThree = () => new Promise<void>((resolve, reject) => {
      if (window.THREE) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load three.js"));
      document.head.appendChild(s);
    });

    const init = async () => {
      await ensureThree();
      if (destroyed || !containerRef.current) return;
      const THREE = window.THREE;

      class App {
        settings = {
          damping: 0.985,
          tension: 0.02,
          resolution: 384,
          rippleStrength: 2.4,
          mouseIntensity: 0.3,
          clickIntensity: 1.6,
          rippleRadius: 18,
          autoDrops: true,
          autoDropInterval: 2800,
          autoDropIntensity: 0.9,
        };

        gradientColors = {
          // Stronger, lighter blues for visible color
          colorA1: new THREE.Vector3(0.220, 0.520, 0.980), // brighter base
          colorA2: new THREE.Vector3(0.340, 0.780, 1.000), // vivid cyan-blue
          // Secondary layer barely used now
          colorB1: new THREE.Vector3(0.220, 0.520, 0.980),
          colorB2: new THREE.Vector3(0.340, 0.780, 1.000),
        };

        container: HTMLElement;
        renderer: any; scene: any; camera: any; clock: any;
        waterBuffers: { current: Float32Array; previous: Float32Array };
        waterTexture: any; backgroundMaterial: any; rafId: number | null = null;
        lastMouse = { x: 0, y: 0 }; throttle = 0; autoInt: any;

        constructor(container: HTMLElement) {
          this.container = container;
          this.init();
        }

        init() {
          const THREE = window.THREE;
          this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          this.renderer.setClearColor(0x1a4ed8, 1); // brighter base blue
          this.resize();
          this.container.appendChild(this.renderer.domElement);

          this.scene = new THREE.Scene();
          this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
          this.camera.position.z = 1;
          this.clock = new THREE.Clock();

          this.initWater();
          this.createBackground();
          this.bindEvents();
          this.setupAutoDrops();
          this.tick();
        }

        resize = () => {
          const w = this.container.clientWidth || window.innerWidth;
          const h = this.container.clientHeight || window.innerHeight;
          this.renderer.setSize(w, h);
          if (this.backgroundMaterial) {
            this.backgroundMaterial.uniforms.resolution.value.set(w, h);
          }
          if (this.scene && this.scene.children[0]) {
            const THREE = window.THREE;
            const mesh: any = this.scene.children[0];
            mesh.geometry.dispose();
            mesh.geometry = new THREE.PlaneGeometry(w, h);
          }
          // Update camera bounds
          this.camera.left = -w / 2; this.camera.right = w / 2; this.camera.top = h / 2; this.camera.bottom = -h / 2; this.camera.updateProjectionMatrix();
        };

        initWater() {
          const THREE = window.THREE;
          const res = this.settings.resolution;
          this.waterBuffers = { current: new Float32Array(res * res), previous: new Float32Array(res * res) };
          this.waterTexture = new THREE.DataTexture(this.waterBuffers.current, res, res, THREE.RedFormat, THREE.FloatType);
          this.waterTexture.minFilter = THREE.LinearFilter; this.waterTexture.magFilter = THREE.LinearFilter; this.waterTexture.needsUpdate = true;
        }

        createBackground() {
          const THREE = window.THREE;
          const uniforms = {
            waterTexture: { value: this.waterTexture },
            rippleStrength: { value: this.settings.rippleStrength },
            resolution: { value: new THREE.Vector2(1, 1) },
            time: { value: 0 },
            colorA1: { value: this.gradientColors.colorA1 },
            colorA2: { value: this.gradientColors.colorA2 },
            colorB1: { value: this.gradientColors.colorB1 },
            colorB2: { value: this.gradientColors.colorB2 },
            bWeight: { value: 0.0 }, // remove secondary layer tint
          };
          const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: `
              varying vec2 vUv;
              void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
            `,
            fragmentShader: `
              uniform sampler2D waterTexture; uniform float rippleStrength; uniform vec2 resolution; uniform float time; 
              uniform vec3 colorA1; uniform vec3 colorA2; uniform vec3 colorB1; uniform vec3 colorB2; uniform float bWeight; varying vec2 vUv;
              float S(float a,float b,float t){return smoothstep(a,b,t);} 
              mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
              float noise(vec2 p){ vec2 ip=floor(p), fp=fract(p); float a=fract(sin(dot(ip,vec2(12.9898,78.233)))*43758.5453); float b=fract(sin(dot(ip+vec2(1.,0.),vec2(12.9898,78.233)))*43758.5453); float c=fract(sin(dot(ip+vec2(0.,1.),vec2(12.9898,78.233)))*43758.5453); float d=fract(sin(dot(ip+vec2(1.,1.),vec2(12.9898,78.233)))*43758.5453); fp=fp*fp*(3.-2.*fp); return mix(mix(a,b,fp.x), mix(c,d,fp.x), fp.y);} 
              void main(){
                float stepX = 1.0 / resolution.x; 
                vec2 grad = vec2(
                  texture2D(waterTexture, vec2(vUv.x + stepX, vUv.y)).r - texture2D(waterTexture, vec2(vUv.x - stepX, vUv.y)).r,
                  texture2D(waterTexture, vec2(vUv.x, vUv.y + stepX)).r - texture2D(waterTexture, vec2(vUv.x, vUv.y - stepX)).r
                ) * rippleStrength * 5.0;
                vec2 tuv = vUv + grad; tuv -= 0.5; float ratio = resolution.x / resolution.y; tuv.y *= 1.0/ratio;
                vec3 layer1 = mix(colorA1, colorA2, S(-0.3, 0.2, (tuv*Rot(radians(-5.0))).x));
                vec3 layer2 = mix(colorB1, colorB2, S(-0.3, 0.2, (tuv*Rot(radians(-5.0))).x));
                vec3 finalComp = mix(layer1, layer2, bWeight * S(0.5, -0.3, tuv.y));
                float n = noise(tuv*20.0 + time*0.1)*0.03; finalComp += vec3(n);
                // Remove vignette to keep edges bright
                finalComp *= 1.65; // stronger brightness boost
                gl_FragColor = vec4(finalComp, 1.0);
              }
            `,
            transparent: false,
            depthWrite: false,
          });
          this.backgroundMaterial = material;
          const w = this.container.clientWidth || window.innerWidth;
          const h = this.container.clientHeight || window.innerHeight;
          const geometry = new THREE.PlaneGeometry(w, h);
          const mesh = new THREE.Mesh(geometry, material);
          this.scene.add(mesh);
        }

        updateWater() {
          const res = this.settings.resolution; const cur = this.waterBuffers.current; const prev = this.waterBuffers.previous;
          const d = this.settings.damping; const t = Math.min(this.settings.tension, 0.05);
          for (let i = 1; i < res - 1; i++) {
            for (let j = 1; j < res - 1; j++) {
              const idx = i * res + j;
              const top = prev[idx - res]; const bot = prev[idx + res]; const left = prev[idx - 1]; const right = prev[idx + 1];
              cur[idx] = (top + bot + left + right) / 2 - cur[idx];
              cur[idx] = cur[idx] * d + prev[idx] * (1 - d);
              cur[idx] += (0 - prev[idx]) * t;
              cur[idx] = Math.max(-1, Math.min(1, cur[idx]));
            }
          }
          // Swap
          this.waterBuffers.current = prev; this.waterBuffers.previous = cur;
          this.waterTexture.image.data = this.waterBuffers.current; this.waterTexture.needsUpdate = true;
        }

        addRipple(x: number, y: number, strength = 1.0) {
          const res = this.settings.resolution; const rad = this.settings.rippleRadius; const rsq = rad * rad;
          const nx = x / (this.container.clientWidth || window.innerWidth); const ny = 1 - y / (this.container.clientHeight || window.innerHeight);
          const tx = Math.floor(nx * res); const ty = Math.floor(ny * res);
          for (let i = -rad; i <= rad; i++) {
            for (let j = -rad; j <= rad; j++) {
              const dsq = i * i + j * j; if (dsq > rsq) continue; const px = tx + i; const py = ty + j; if (px<0||px>=res||py<0||py>=res) continue;
              const idx = py * res + px; const dist = Math.sqrt(dsq); const val = Math.cos(((dist / rad) * Math.PI) / 2) * strength;
              this.waterBuffers.previous[idx] += val;
            }
          }
        }

        bindEvents() {
          window.addEventListener("resize", this.resize);
          const onMove = (ev: MouseEvent) => {
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
            const now = performance.now(); if (now - this.throttle < 16) return; this.throttle = now;
            const dx = x - this.lastMouse.x; const dy = y - this.lastMouse.y; const dsq = dx*dx + dy*dy;
            if (dsq > 5) { this.addRipple(x, y, this.settings.mouseIntensity); this.lastMouse = { x, y }; }
          };
          const onClick = (ev: MouseEvent) => {
            const rect = this.container.getBoundingClientRect();
            const x = ev.clientX - rect.left; const y = ev.clientY - rect.top; this.addRipple(x, y, this.settings.clickIntensity);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("click", onClick);
        }

        setupAutoDrops() {
          if (this.autoInt) clearInterval(this.autoInt);
          if (this.settings.autoDrops) {
            this.autoInt = setInterval(() => {
              const w = this.container.clientWidth || window.innerWidth; const h = this.container.clientHeight || window.innerHeight;
              this.addRipple(Math.random()*w, Math.random()*h, this.settings.autoDropIntensity);
            }, this.settings.autoDropInterval);
          }
        }

        tick = () => {
          this.updateWater();
          // Animate SVG turbulence for heading distortion if present
          const turb = document.getElementById('turbulence') as unknown as SVGFETurbulenceElement | null;
          if (turb) {
            const t = this.clock.getElapsedTime();
            const f1 = 0.015 + Math.sin(t * 0.5) * 0.005;
            const f2 = 0.010 + Math.cos(t * 0.3) * 0.003;
            turb.setAttribute('baseFrequency', `${f1} ${f2}`);
          }
          if (this.backgroundMaterial) {
            this.backgroundMaterial.uniforms.rippleStrength.value = this.settings.rippleStrength;
            this.backgroundMaterial.uniforms.time.value += this.clock.getDelta();
          }
          this.renderer.render(this.scene, this.camera);
          this.rafId = requestAnimationFrame(this.tick);
        };

        destroy() {
          window.removeEventListener("resize", this.resize);
          if (this.autoInt) clearInterval(this.autoInt);
          if (this.rafId) cancelAnimationFrame(this.rafId);
          if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
          }
        }
      }

      app = new App(containerRef.current);
    };

    init();
    return () => { destroyed = true; if (app && app.destroy) app.destroy(); };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" aria-hidden style={{ background: "#0b337f" }} />;
}
