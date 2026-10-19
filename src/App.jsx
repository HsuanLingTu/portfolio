
import { useEffect, useRef, useState } from 'react'
import { toCanvas } from 'html-to-image'
import { motion } from 'motion/react'
import logo from './assets/main-logo.svg'
import LiquidRibbon from './LiquidRibbon.jsx'

const titleGradient =
  'bg-gradient-to-r from-[#F8D9E8] via-[#E4DDFB] to-[#D5EEFF] bg-clip-text font-semibold text-transparent'

// 火星從上方中央出發，沿著圓角邊框順時針移動
const sparkPath =
  'M 120 1 H 216 A 23 23 0 0 1 239 24 A 23 23 0 0 1 216 47 H 24 A 23 23 0 0 1 1 24 A 23 23 0 0 1 24 1 H 120'

function App() {
  const heroRef = useRef(null)
  const sparkMotionRef = useRef(null)

  const [backgroundCanvas, setBackgroundCanvas] = useState(null)
  const [ctaActive, setCtaActive] = useState(false)

  function startSpark() {
    setCtaActive(true)

    try {
      sparkMotionRef.current?.beginElement()
    } catch (error) {
      console.warn('Spark animation could not start:', error)
    }
  }

  function stopSpark() {
    setCtaActive(false)

    try {
      sparkMotionRef.current?.endElement()
    } catch (error) {
      console.warn('Spark animation could not stop:', error)
    }
  }

  useEffect(() => {
    let cancelled = false
    let timer

    async function captureHero() {
      try {
        await document.fonts.ready

        await new Promise((resolve) => {
          timer = setTimeout(resolve, 1800)
        })

        if (cancelled || !heroRef.current) return

        const canvas = await toCanvas(heroRef.current, {
          pixelRatio: 1,
          backgroundColor: '#ffffff',
          filter: (node) =>
            !node.classList?.contains('liquid-glass-canvas'),
        })

        if (cancelled) return

        setBackgroundCanvas(canvas)

        console.log('Hero background refreshed:', {
          width: canvas.width,
          height: canvas.height,
        })
      } catch (error) {
        console.error('Hero background capture failed:', error)
      }
    }

    captureHero()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <style>{`
        .work-cta {
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;
        }

        /* 常駐的粉、紫、藍色細邊框 */
        .work-cta__outline {
          position: absolute;
          inset: 0;
          border: 1.5px solid transparent;
          border-radius: 9999px;
          background:
            linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01)) padding-box,
            linear-gradient(110deg, #F8D9E8, #E4DDFB, #D5EEFF) border-box;
          opacity: 0.8;
          pointer-events: none;
        }

        /* 玻璃按鈕表面 */
        .work-cta__surface {
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1px 0 rgba(220, 218, 230, 0.22),
            0 3px 12px rgba(100, 90, 120, 0.04);
          transition:
            background 250ms ease,
            box-shadow 250ms ease;
        }

        .work-cta:hover .work-cta__surface,
        .work-cta:focus-visible .work-cta__surface {
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 1),
            inset 0 -1px 0 rgba(220, 218, 230, 0.15),
            0 4px 20px rgba(180, 160, 210, 0.1);
        }

        /* 火星與尾巴只在 hover / 鍵盤 focus 時顯示 */
        .work-cta__spark {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
          opacity: 0;
          transition: opacity 180ms ease;
        }

        .work-cta--active .work-cta__spark {
          opacity: 1;
        }

        .work-cta__tail {
          fill: none;
          stroke: url(#ignite-gradient);
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--tail-length) 1000;
          stroke-dashoffset: var(--tail-length);
          filter:
            drop-shadow(0 0 3px rgba(248, 217, 232, 0.65))
            drop-shadow(0 0 6px rgba(228, 221, 251, 0.45));
        }

        /* 每層尾巴長度不同，往後逐漸變淡 */
        .work-cta__tail--long {
          --tail-length: 150;
          stroke-width: 3;
          opacity: 0.28;
        }

        .work-cta__tail--medium {
          --tail-length: 105;
          stroke-width: 2.8;
          opacity: 0.45;
        }

        .work-cta__tail--short {
          --tail-length: 65;
          stroke-width: 2.6;
          opacity: 0.7;
        }

        .work-cta__tail--near {
          --tail-length: 28;
          stroke-width: 2.4;
          opacity: 1;
        }

        .work-cta--active .work-cta__tail--long {
          animation: ignite-long 6.5s linear infinite;
        }

        .work-cta--active .work-cta__tail--medium {
          animation: ignite-medium 6.5s linear infinite;
        }

        .work-cta--active .work-cta__tail--short {
          animation: ignite-short 6.5s linear infinite;
        }

        .work-cta--active .work-cta__tail--near {
          animation: ignite-near 6.5s linear infinite;
        }

        /*
          尾巴從火星後方延伸。
          不同長度的線段同步移動，末端逐層淡出。
        */
        @keyframes ignite-long {
          from { stroke-dashoffset: 150; }
          to { stroke-dashoffset: -850; }
        }

        @keyframes ignite-medium {
          from { stroke-dashoffset: 105; }
          to { stroke-dashoffset: -895; }
        }

        @keyframes ignite-short {
          from { stroke-dashoffset: 65; }
          to { stroke-dashoffset: -935; }
        }

        @keyframes ignite-near {
          from { stroke-dashoffset: 28; }
          to { stroke-dashoffset: -972; }
        }

        .work-cta__spark-head {
          fill: #fff;
          opacity: 0;
          filter:
            drop-shadow(0 0 2px #fff)
            drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))
            drop-shadow(0 0 9px rgba(228, 221, 251, 0.95));
        }

        .work-cta--active .work-cta__spark-head {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .work-cta--active .work-cta__tail {
            animation-duration: 12s;
          }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between gap-6 px-8 py-6 md:px-16">
        <div className="flex min-w-0 items-center gap-5 md:gap-8">
          <a href="#" className="inline-flex shrink-0 items-center">
            <img
              src={logo}
              alt="Personal logo"
              className="h-14 w-auto"
            />
          </a>
        </div>

        <nav className="flex shrink-0 gap-4 text-xs text-neutral-500 sm:gap-6 sm:text-sm">
          <a href="#work" className="transition hover:text-black">
            Work
          </a>
          <a href="#work" className="transition hover:text-black">
            Case Study
          </a>
          <a href="#about" className="transition hover:text-black">
            About
          </a>
          <a href="#contact" className="transition hover:text-black">
            Contact
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[75vh] flex-col justify-center overflow-visible px-8 py-20 md:px-16"
      >
        <motion.p
          className="mb-6 text-xs tracking-[0.3em] text-neutral-400 uppercase"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          UX / UI Designer · Product Thinker
        </motion.p>

        <motion.h1
          className="relative z-0 max-w-5xl text-5xl leading-[1.08] font-light tracking-tight md:text-8xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <span className={titleGradient}>Observing</span>{' '}
          the world.
          <br />
          Designing for{' '}
          <span className={titleGradient}>change.</span>
        </motion.h1>

        <motion.p
          className="mt-8 max-w-lg text-base leading-7 text-neutral-500 md:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          I observe the world, uncover meaningful problems, and turn insights
          into thoughtful design that creates positive change.
        </motion.p>

        {/* Liquid Glass Explore Work CTA */}
        <motion.a
          href="#work"
          aria-label="Explore selected work"
          className={`work-cta relative z-20 mt-10 inline-flex w-fit cursor-pointer items-center justify-center rounded-full p-[1.5px] text-neutral-700 no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#D8C8F5] focus-visible:ring-offset-4 ${
            ctaActive ? 'work-cta--active' : ''
          }`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          onHoverStart={startSpark}
          onHoverEnd={stopSpark}
          onFocus={startSpark}
          onBlur={stopSpark}
          onTapStart={startSpark}
          onTapCancel={stopSpark}
        >
          {/* 靜態的粉紫藍外框 */}
          <span aria-hidden="true" className="work-cta__outline" />

          {/* Glass surface */}
          <span className="work-cta__surface relative inline-flex items-center gap-3 rounded-full border border-white/80 px-6 py-3 text-sm">
            <span>Explore selected work</span>
            <span aria-hidden="true">↘</span>
          </span>

          {/* Moving spark and fading tail */}
          <svg
            aria-hidden="true"
            className="work-cta__spark"
            viewBox="0 0 240 48"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="ignite-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#F8D9E8" stopOpacity="0.15" />
                <stop offset="35%" stopColor="#F8D9E8" stopOpacity="0.75" />
                <stop offset="65%" stopColor="#E4DDFB" stopOpacity="0.9" />
                <stop offset="88%" stopColor="#D5EEFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Long, soft tail */}
            <path
              className="work-cta__tail work-cta__tail--long"
              d={sparkPath}
              pathLength="1000"
            />

            {/* Middle tail */}
            <path
              className="work-cta__tail work-cta__tail--medium"
              d={sparkPath}
              pathLength="1000"
            />

            {/* Shorter, brighter tail */}
            <path
              className="work-cta__tail work-cta__tail--short"
              d={sparkPath}
              pathLength="1000"
            />

            {/* Bright section directly behind the spark */}
            <path
              className="work-cta__tail work-cta__tail--near"
              d={sparkPath}
              pathLength="1000"
            />

            {/* Actual white spark head following the same path */}
            <circle className="work-cta__spark-head" r="3.5">
              <animateMotion
                ref={sparkMotionRef}
                path={sparkPath}
                dur="6.5s"
                rotate="auto"
                begin="indefinite"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </motion.a>

        {/* Liquid Glass background decoration */}
        <div
          className="liquid-glass-canvas pointer-events-none absolute top-[55%] left-1/2 z-10 w-screen -translate-x-1/2 -translate-y-1/2 [&_*]:pointer-events-none"
          aria-hidden="true"
        >
          <LiquidRibbon
            backgroundCanvas={backgroundCanvas}
            heroRef={heroRef}
          />
        </div>
      </section>

      {/* Selected Work */}
      <section
        id="work"
        className="border-t border-neutral-100 px-8 py-24 md:px-16"
      >
        <p className="mb-4 text-xs tracking-[0.25em] text-neutral-400 uppercase">
          01 / Selected work
        </p>

        <h2 className="text-3xl font-light tracking-tight md:text-5xl">
          Thoughtful work.
          <br />
          Tangible impact.
        </h2>

        <p className="mt-5 max-w-xl leading-7 text-neutral-500">
          A selection of product design, interface experiments, and creative
          projects. Case studies coming soon.
        </p>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t border-neutral-100 px-8 py-24 md:px-16"
      >
        <p className="mb-4 text-xs tracking-[0.25em] text-neutral-400 uppercase">
          02 / About
        </p>

        <h2 className="max-w-3xl text-3xl leading-tight font-light tracking-tight md:text-5xl">
          Curious about people, systems, and the space between technology and
          creativity.
        </h2>
      </section>

      {/* Contact */}
      <footer
        id="contact"
        className="border-t border-neutral-100 px-8 py-10 md:px-16"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-500">
            Open to meaningful collaborations.
          </p>

          <a
            href="mailto:hello@example.com"
            className="w-fit text-sm underline underline-offset-4 transition hover:text-neutral-500"
          >
            Get in touch ↗
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-100 pt-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Hsuan-Ling Tu. All rights reserved.</p>
          <p>Designed with intention.</p>
        </div>
      </footer>

    </main>
  )
}

export default App
