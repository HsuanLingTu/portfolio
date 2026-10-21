import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { useEffect, useRef, useState } from 'react'
import { toCanvas } from 'html-to-image'
import { motion } from 'motion/react'
import logo from './assets/main-logo.svg'
import LiquidRibbon from './components/LiquidRibbon.jsx'
import { Link } from 'react-router'
import IgniteButton from './components/IgniteButton.jsx'
import { useLocale } from './useLocale.js'

const titleGradient =
  'bg-gradient-to-r from-[#F8D9E8] via-[#E4DDFB] to-[#D5EEFF] bg-clip-text font-semibold text-transparent'

const sparkPath =
  'M 120 1 H 216 A 23 23 0 0 1 239 24 A 23 23 0 0 1 216 47 H 24 A 23 23 0 0 1 1 24 A 23 23 0 0 1 24 1 H 120'

const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Case Study', href: '/case-study' },
  { label: 'About', href: '/about' },
]

function App() {
  const { t } = useLocale()
  const home = t.home

  const heroRef = useRef(null)
  const sparkMotionRef = useRef(null)

  const [backgroundCanvas, setBackgroundCanvas] = useState(null)
  const [ctaActive, setCtaActive] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    // 語言或文字改變時，清除舊的背景截圖
    setBackgroundCanvas(null)

    async function captureHero() {
      try {
        await document.fonts.ready

        // 等待新語言的文字完成排版
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

        // 避免舊語言的截圖覆蓋新語言
        if (cancelled) return

        setBackgroundCanvas(canvas)

      } catch (error) {
        if (!cancelled) {
          console.error('Hero background capture failed:', error)
        }
      }
    }

    captureHero()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [home])


  // 畫面切換至桌面尺寸時，自動關閉手機選單
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')

    function handleResize(event) {
      if (event.matches) {
        setMobileMenuOpen(false)
      }
    }

    mediaQuery.addEventListener('change', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <style>{`
        .work-cta {
          isolation: isolate;
          -webkit-tap-highlight-color: transparent;
        }

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

      <Header />

      {/* Hero */}
      <section
        id="top"
        ref={heroRef}
        className="relative isolate flex min-h-[75vh] flex-col justify-center overflow-visible px-6 py-20 sm:px-8 md:px-16"
      >
        <motion.p
          className="mb-6 text-xs tracking-[0.3em] text-neutral-400 uppercase"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {home.eyebrow}
        </motion.p>

        <motion.h1
          className="relative z-0 max-w-5xl text-5xl leading-[1.08] font-light tracking-tight sm:text-6xl md:text-8xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <span className={titleGradient}>{home.titleFirst}</span>{' '}
          {home.titleSecond}
          <br />
          {home.titleThird}{' '}
          <span className={titleGradient}>{home.titleFourth}</span>
        </motion.h1>

        <motion.p
          className="mt-8 max-w-lg text-base leading-7 text-neutral-500 md:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          {home.description}
        </motion.p>

        {/* Liquid Glass Explore Work CTA */}
        <Link to="/work" className="relative z-20 mt-10">
          <IgniteButton
            aria-label={home.exploreWorkLabel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <span>{home.exploreWork}</span>
            <span aria-hidden="true">↘</span>
          </IgniteButton>
        </Link>

        {/* Liquid Glass background decoration */}
        <div
          className="liquid-ribbon-layer pointer-events-none absolute top-[55%] left-1/2 z-10 w-screen -translate-x-1/2 -translate-y-1/2 [&_*]:pointer-events-none"
          aria-hidden="true"
        >
          <LiquidRibbon
            backgroundCanvas={backgroundCanvas}
            heroRef={heroRef}
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default App