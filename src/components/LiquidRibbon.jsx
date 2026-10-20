
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import * as THREE from 'three'

// --------------------------------------------------
// Glass material settings
// --------------------------------------------------

const GLASS = {
  refraction: 0.055,
  dispersion: 0.009,
  tint: [0.86, 0.88, 0.92],
  tintStrength: 0.72,
  outerRimStrength: 0.85,
  edgeGlintStrength: 1.1,
  innerShadowStrength: 0.28,
  colorFringeStrength: 0.22,
}

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -viewPosition.xyz;

    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uBackground;
  uniform vec2 uResolution;
  uniform vec4 uMap;
  uniform float uRefraction;
  uniform float uDispersion;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec2 screenUV = gl_FragCoord.xy / uResolution;

    vec2 backgroundUV = vec2(
      uMap.x + screenUV.x * uMap.z,
      uMap.y + screenUV.y * uMap.w
    );

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    float facing = abs(dot(normal, viewDir));
    float fresnel = pow(
      1.0 - clamp(facing, 0.0, 1.0),
      2.0
    );

    // Refraction and chromatic dispersion.
    vec2 distortion = normal.xy * uRefraction;
    vec2 dispersionOffset = normal.xy * uDispersion;

    vec3 center = texture2D(
      uBackground,
      clamp(backgroundUV + distortion, 0.001, 0.999)
    ).rgb;

    vec3 redSample = texture2D(
      uBackground,
      clamp(
        backgroundUV + distortion + dispersionOffset,
        0.001,
        0.999
      )
    ).rgb;

    vec3 blueSample = texture2D(
      uBackground,
      clamp(
        backgroundUV + distortion - dispersionOffset,
        0.001,
        0.999
      )
    ).rgb;

    vec3 glass = vec3(
      redSample.r,
      center.g,
      blueSample.b
    );

    // Cool-gray glass body.
    vec3 glassTint = vec3(0.86, 0.88, 0.92);
    glass = mix(glass, glassTint, 0.72);

    // Specular highlights.
    vec3 keyLight = normalize(vec3(-0.48, 0.68, 0.72));
    vec3 fillLight = normalize(vec3(0.68, 0.24, 0.69));

    float keySpecular = pow(
      max(dot(normal, keyLight), 0.0),
      30.0
    );

    float fillSpecular = pow(
      max(dot(normal, fillLight), 0.0),
      48.0
    );

    float sweep = 0.5 + 0.5 * sin(
      uTime * 0.65 +
      normal.x * 5.0 +
      normal.y * 3.5
    );

    vec3 movingLight = normalize(vec3(
      sin(uTime * 0.28) * 0.55,
      0.55,
      0.8
    ));

    float movingSpecular = pow(
      max(dot(normal, movingLight), 0.0),
      38.0
    ) * sweep;

    vec3 highlights =
      vec3(1.0) * keySpecular * 0.95 +
      vec3(0.94, 0.97, 1.0) * fillSpecular * 0.58 +
      vec3(1.0) * movingSpecular * 0.40;

    // Blue-violet outer contour.
    float outerRim = smoothstep(0.18, 0.70, fresnel);

    vec3 rimColor = mix(
      vec3(0.38, 0.53, 0.80),
      vec3(0.67, 0.43, 0.91),
      0.5 + 0.5 * sin(normal.x * 4.0 + normal.y * 3.0)
    );

    float rimVariation = 0.70 + 0.30 * (
      0.5 + 0.5 * sin(
        normal.x * 8.0 -
        normal.y * 6.0 +
        uTime * 0.3
      )
    );

    glass += rimColor * outerRim * rimVariation * 0.85;

    // Selective white edge reflections.
    float edgeGlint = smoothstep(0.42, 0.82, fresnel);

    float glintPattern = pow(
      max(
        0.0,
        0.5 + 0.5 * sin(
          normal.x * 10.0 -
          normal.y * 7.0 +
          uTime * 0.35
        )
      ),
      1.5
    );

    glass += vec3(1.0) *
      edgeGlint *
      (0.30 + glintPattern * 0.70) *
      1.10;

    // Inner edge shadow for glass thickness.
    float innerEdge = smoothstep(0.18, 0.43, fresnel) *
      (1.0 - smoothstep(0.55, 0.82, fresnel));

    vec3 innerShadow = vec3(0.56, 0.61, 0.75);

    glass = mix(
      glass,
      glass * innerShadow,
      innerEdge * 0.28
    );

    // Subtle blue-violet color fringe.
    float colorFringe = smoothstep(0.25, 0.88, fresnel);

    vec3 blueFringe = vec3(0.55, 0.76, 1.0);
    vec3 purpleFringe = vec3(0.83, 0.64, 1.0);

    float sideMix = smoothstep(-0.45, 0.45, normal.x);
    vec3 fringeColor = mix(blueFringe, purpleFringe, sideMix);

    glass = mix(
      glass,
      glass * fringeColor,
      colorFringe * 0.22
    );

    // Soft inner reflection.
    float innerReflection = pow(
      max(dot(normal, normalize(vec3(0.0, 0.8, 0.6))), 0.0),
      10.0
    );

    glass += vec3(0.84, 0.89, 1.0) *
      innerReflection *
      smoothstep(0.12, 0.65, fresnel) *
      0.12;

    glass += highlights;

    gl_FragColor = vec4(glass, 1.0);

    #include <colorspace_fragment>
  }
`

function LiquidChrome({ pointer, backgroundCanvas, heroRef }) {
  const [textureReady, setTextureReady] = useState(false)

  const texture = useMemo(() => {
    if (!backgroundCanvas) return null

    const nextTexture = new THREE.CanvasTexture(backgroundCanvas)

    nextTexture.colorSpace = THREE.SRGBColorSpace
    nextTexture.minFilter = THREE.LinearFilter
    nextTexture.magFilter = THREE.LinearFilter
    nextTexture.wrapS = THREE.ClampToEdgeWrapping
    nextTexture.wrapT = THREE.ClampToEdgeWrapping
    nextTexture.generateMipmaps = false

    return nextTexture
  }, [backgroundCanvas])

  useEffect(() => {
    return () => texture?.dispose()
  }, [texture])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBackground: { value: null },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uMap: { value: new THREE.Vector4(0, 0, 1, 1) },
          uRefraction: { value: GLASS.refraction },
          uDispersion: { value: GLASS.dispersion },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: false,
        depthWrite: true,
        toneMapped: false,
      }),
    []
  )

  useEffect(() => {
    setTextureReady(false)
    material.uniforms.uBackground.value = null

    if (!texture || !backgroundCanvas) return

    let cancelled = false
    texture.needsUpdate = true

    const checkTexture = () => {
      if (cancelled) return

      if (texture.image?.width > 0 && texture.image?.height > 0) {
        material.uniforms.uBackground.value = texture
        setTextureReady(true)
      }
    }

    checkTexture()

    return () => {
      cancelled = true
    }
  }, [material, texture, backgroundCanvas])

  const surface = useMemo(() => {
    const mesh = new MarchingCubes(
      48,
      material,
      true,
      false,
      120000
    )

    mesh.isolation = 80
    mesh.scale.set(3.8, 2.7, 1.65)

    return mesh
  }, [material])

  const cursor = useRef({
    x: 0,
    y: 0,
    power: 0,
  })

  const drawingSize = useMemo(
    () => new THREE.Vector2(),
    []
  )

  useFrame(({ clock, gl }, delta) => {
    const t = clock.elapsedTime
    const smooth = 1 - Math.exp(-delta * 5)
    const targetPower = pointer.current.active ? 1 : 0

    cursor.current.x +=
      (pointer.current.x - cursor.current.x) * smooth

    cursor.current.y +=
      (pointer.current.y - cursor.current.y) * smooth

    cursor.current.power +=
      (targetPower - cursor.current.power) *
      (1 - Math.exp(-delta * 3))

    const { x, y, power } = cursor.current

    surface.reset()

    // Main liquid ribbon.
    for (let i = 0; i < 12; i++) {
      const u = i / 12
      const a = u * Math.PI * 2

      const twist =
        a * 1.25 +
        Math.sin(t * 0.3 + a * 2) * 0.55

      const r =
        0.22 +
        0.09 * Math.sin(a * 3 + t * 0.22) +
        0.045 * Math.cos(a * 5 - t * 0.18)

      const px =
        0.5 +
        Math.cos(twist) * r +
        0.06 * Math.sin(t * 0.25 + a * 2)

      const py =
        0.5 +
        Math.sin(twist * 1.2) * r * 0.9 +
        0.07 * Math.sin(a * 2 - t * 0.22)

      const pz =
        0.5 +
        Math.sin(twist * 1.7 + t * 0.17) * 0.2

      const strength =
        0.7 +
        0.22 * (
          0.5 + 0.5 * Math.sin(a * 3 + t * 0.25)
        )

      surface.addBall(px, py, pz, strength, 12)
    }

    // Additional liquid masses.
    surface.addBall(
      0.5 + 0.22 * Math.sin(t * 0.22),
      0.5 + 0.22 * Math.cos(t * 0.28),
      0.52 + 0.12 * Math.sin(t * 0.2),
      0.9,
      12
    )

    surface.addBall(
      0.5 + 0.28 * Math.cos(t * 0.18 + 1.8),
      0.5 + 0.17 * Math.sin(t * 0.24 + 1),
      0.5 + 0.16 * Math.cos(t * 0.22),
      0.68,
      12
    )

    // Mouse interaction.
    if (power > 0.005) {
      const mouseX = THREE.MathUtils.clamp(
        0.5 + x * 0.3,
        0.15,
        0.85
      )

      const mouseY = THREE.MathUtils.clamp(
        0.5 + y * 0.24,
        0.18,
        0.82
      )

      surface.addBall(mouseX, mouseY, 0.7, 1.65 * power, 12)

      surface.addBall(
        THREE.MathUtils.clamp(mouseX - 0.075, 0.1, 0.9),
        THREE.MathUtils.clamp(mouseY + 0.055, 0.1, 0.9),
        0.62,
        0.85 * power,
        12
      )

      surface.addBall(
        THREE.MathUtils.clamp(mouseX + 0.065, 0.1, 0.9),
        THREE.MathUtils.clamp(mouseY - 0.065, 0.1, 0.9),
        0.56,
        0.7 * power,
        12
      )
    }

    surface.update()

    surface.rotation.y +=
      (x * 0.12 - surface.rotation.y) * smooth

    surface.rotation.x +=
      (-y * 0.09 - surface.rotation.x) * smooth

    gl.getDrawingBufferSize(drawingSize)
    material.uniforms.uResolution.value.copy(drawingSize)
    material.uniforms.uTime.value = t

    if (texture && heroRef?.current) {
      const heroRect = heroRef.current.getBoundingClientRect()
      const canvasRect = gl.domElement.getBoundingClientRect()

      if (heroRect.width > 0 && heroRect.height > 0) {
        material.uniforms.uMap.value.set(
          (canvasRect.left - heroRect.left) / heroRect.width,
          (heroRect.bottom - canvasRect.bottom) / heroRect.height,
          canvasRect.width / heroRect.width,
          canvasRect.height / heroRect.height
        )
      }
    }
  })

  if (!textureReady) return null

  return (
    <group position={[2.8, 1.0, 0]}>
      <primitive object={surface} dispose={null} />
    </group>
  )
}

function GlassEnvironment() {
  return (
    <>
      <ambientLight intensity={0.7} />

      <Environment resolution={256}>
        <Lightformer
          form="rect"
          color="#FFF9F0"
          intensity={8}
          position={[0, 5, -3]}
          scale={[10, 5, 1]}
        />
        <Lightformer
          form="rect"
          color="#DCC6F2"
          intensity={6}
          position={[-5, 1, 3]}
          scale={[3, 7, 1]}
        />
        <Lightformer
          form="rect"
          color="#B9A0E8"
          intensity={3}
          position={[5, 1, 2]}
          scale={[3, 7, 1]}
        />
        <Lightformer
          form="rect"
          color="#77718F"
          intensity={2}
          position={[0, -3, -2]}
          scale={[8, 2, 1]}
        />
        <Lightformer
          form="rect"
          color="#F8F0FF"
          intensity={5}
          position={[0, -2, 4]}
          scale={[8, 2, 1]}
        />
      </Environment>
    </>
  )
}

export default function LiquidRibbon({ backgroundCanvas, heroRef }) {
  const pointer = useRef({
    x: 0,
    y: 0,
    active: false,
  })

  return (
    <div className="relative h-[1000px] w-full md:h-[1200px]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.2], fov: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()

          pointer.current.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1

          pointer.current.y =
            1 - ((event.clientY - rect.top) / rect.height) * 2

          pointer.current.active = true
        }}
        onPointerLeave={() => {
          pointer.current.active = false
        }}
      >
        <GlassEnvironment />

        {backgroundCanvas && (
          <LiquidChrome
            pointer={pointer}
            backgroundCanvas={backgroundCanvas}
            heroRef={heroRef}
          />
        )}
      </Canvas>
    </div>
  )
}
