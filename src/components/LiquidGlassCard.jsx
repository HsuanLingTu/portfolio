import { useCallback, useEffect, useRef, useState } from 'react'
import { toCanvas } from 'html-to-image'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  varying vec2 vLocal;

  uniform vec2 uPointer;
  uniform float uActive;
  uniform float uTime;

  void main() {
    vUv = uv;

    vec2 p = position.xy;
    vec2 pointer = uPointer * 2.0 - 1.0;
    vec2 delta = p - pointer;

    float d = length(delta);
    float influence = exp(-d * d * 3.0) * uActive;

    float edgeX = smoothstep(0.45, 0.98, abs(p.x));
    float edgeY = smoothstep(0.45, 0.98, abs(p.y));
    vec2 edge = vec2(edgeX, edgeY);

    float wave = sin(uTime * 4.0 - d * 7.0);
    vec2 displacement = normalize(delta + vec2(0.0001))
      * influence
      * (0.035 + wave * 0.012);

    p += displacement * (0.35 + max(edge.x, edge.y) * 1.5);

    vLocal = p;

    gl_Position = projectionMatrix
      * modelViewMatrix
      * vec4(p, position.z, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uPointer;
  uniform float uActive;
  uniform float uTime;

  varying vec2 vUv;
  varying vec2 vLocal;

  void main() {
    vec2 uv = vUv;
    vec2 delta = uv - uPointer;
    float d = length(delta);

    float influence = exp(-d * d * 12.0) * uActive;

    vec2 direction = normalize(delta + vec2(0.0001));
    float wave = sin(d * 24.0 - uTime * 3.0);

    vec2 distortion = direction
      * influence
      * (0.012 + wave * 0.003);

    vec2 sampleUV = clamp(uv + distortion, 0.002, 0.998);

    vec2 fringe = direction * influence * 0.0025;

    vec3 center = texture2D(uTexture, sampleUV).rgb;

    float red = texture2D(
      uTexture,
      clamp(sampleUV + fringe, 0.002, 0.998)
    ).r;

    float blue = texture2D(
      uTexture,
      clamp(sampleUV - fringe, 0.002, 0.998)
    ).b;

    vec3 color = vec3(red, center.g, blue);

    float slope = exp(-d * d * 8.0) * influence;
    color += vec3(0.035, 0.045, 0.065) * slope;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
  }
`

function LiquidGlassCard({
  image,
  video,
  title,
  isChinese,
  children,
  mediaAspect = '3/2',
}) {
  const cardRef = useRef(null)
  const contentRef = useRef(null)
  const canvasRef = useRef(null)
  const materialRef = useRef(null)
  const textureRef = useRef(null)
  const frameRef = useRef(0)
  const captureIdRef = useRef(0)

  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    active: 0,
  })

  const [ready, setReady] = useState(false)

  const captureCard = useCallback(async () => {
    const content = contentRef.current

    if (!content) return

    const captureId = ++captureIdRef.current

    const isCurrentCapture = () =>
      captureIdRef.current === captureId

    try {
      await document.fonts.ready

      if (!isCurrentCapture() || !contentRef.current) return

      // 確保卡片內的圖片載入完成後再擷取。
      const images = Array.from(
        contentRef.current.querySelectorAll('img')
      )

      await Promise.all(
        images.map(async (img) => {
          img.loading = 'eager'

          if (!img.complete) {
            await new Promise((resolve) => {
              const finish = () => {
                img.removeEventListener('load', finish)
                img.removeEventListener('error', finish)
                resolve()
              }

              img.addEventListener('load', finish, { once: true })
              img.addEventListener('error', finish, { once: true })
            })
          }

          if (img.complete && img.naturalWidth > 0) {
            try {
              await img.decode()
            } catch {
              // 圖片已載入但無法 decode 時，仍嘗試擷取。
            }
          }
        })
      )

      if (!isCurrentCapture() || !contentRef.current) return

      // 等待版面完成更新，避免擷取到尚未穩定的尺寸。
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })

      if (!isCurrentCapture() || !contentRef.current) return

      const canvas = await toCanvas(contentRef.current, {
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        cacheBust: true,
        backgroundColor: '#ffffff',
      })

      // 如果這次擷取已經過期，不再更新材質。
      if (!isCurrentCapture()) return

      const texture = new THREE.CanvasTexture(canvas)

      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = false

      if (!materialRef.current) {
        texture.dispose()
        return
      }

      const previousTexture = textureRef.current

      textureRef.current = texture
      materialRef.current.uniforms.uTexture.value = texture

      if (previousTexture) {
        previousTexture.dispose()
      }

      setReady(true)
    } catch (error) {
      if (isCurrentCapture()) {
        console.error(
          'Unable to capture liquid glass card:',
          error
        )
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer
    let geometry
    let material
    let observer
    let animationId = 0
    let disposed = false

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
      )
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setClearColor(0x000000, 0)

      material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: null },
          uPointer: {
            value: new THREE.Vector2(0.5, 0.5),
          },
          uResolution: {
            value: new THREE.Vector2(1, 1),
          },
          uActive: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      })

      geometry = new THREE.PlaneGeometry(2, 2, 128, 128)

      const mesh = new THREE.Mesh(geometry, material)
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(
        -1, 1, 1, -1, 0.1, 10
      )

      camera.position.z = 2
      scene.add(mesh)

      materialRef.current = material

      const resize = () => {
        if (disposed) return

        const rect = cardRef.current?.getBoundingClientRect()

        if (!rect || rect.width <= 0 || rect.height <= 0) {
          return
        }

        renderer.setSize(rect.width, rect.height, false)

        material.uniforms.uResolution.value.set(
          rect.width,
          rect.height
        )
      }

      resize()

      observer = new ResizeObserver(resize)

      if (cardRef.current) {
        observer.observe(cardRef.current)
      }

      const clock = new THREE.Clock()

      const render = () => {
        if (disposed) return

        animationId = requestAnimationFrame(render)

        const elapsed = clock.getElapsedTime()
        const target = pointerRef.current.active
        const current = material.uniforms.uActive.value

        material.uniforms.uActive.value +=
          (target - current) * 0.12

        material.uniforms.uPointer.value.lerp(
          new THREE.Vector2(
            pointerRef.current.x,
            pointerRef.current.y
          ),
          0.16
        )

        material.uniforms.uTime.value = elapsed

        renderer.render(scene, camera)
      }

      render()
    } catch (error) {
      console.error(
        'Unable to initialize liquid glass renderer:',
        error
      )
    }

    return () => {
      disposed = true

      // 讓尚未完成的非同步擷取失效。
      captureIdRef.current += 1

      cancelAnimationFrame(animationId)
      cancelAnimationFrame(frameRef.current)

      observer?.disconnect()

      geometry?.dispose()
      material?.dispose()

      textureRef.current?.dispose()
      textureRef.current = null

      renderer?.dispose()

      if (materialRef.current === material) {
        materialRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (video) {
      setReady(false)
      return
    }
  
    setReady(false)
    captureCard()
  
    return () => {
      captureIdRef.current += 1
    }
  }, [captureCard, image, video, title, isChinese])

  function handlePointerMove(event) {
    if (event.pointerType !== 'mouse') return

    const rect = event.currentTarget.getBoundingClientRect()

    if (rect.width <= 0 || rect.height <= 0) return

    pointerRef.current.x =
      (event.clientX - rect.left) / rect.width

    pointerRef.current.y =
      1 - (event.clientY - rect.top) / rect.height

    pointerRef.current.active = 1
  }

  function handlePointerLeave() {
    pointerRef.current.active = 0
  }

  return (
    <div
      ref={cardRef}
      className="liquid-glass-card relative isolate"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={contentRef}
        className={`liquid-glass-content ${
          ready && !video ? 'is-captured' : ''
        }`}
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: mediaAspect.replace('/', ' / ') }}
        >
          {video ? (
            <video
              src={video}
              poster={image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={title}
              className="h-full w-full object-cover"
            />
          ) : image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                {isChinese ? '作品預覽' : 'Project Preview'}
              </span>
            </div>
          )}
        </div>

        {children}
      </div>

      {!video && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`liquid-glass-canvas ${ready ? 'is-ready' : ''}`}
        />
      )}
    </div>
  )
}

export default LiquidGlassCard