import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { motion } from 'motion/react'
import logo from './assets/main-logo.svg'
import IgniteButton from './components/IgniteButton.jsx'

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    icon: 'in',
  },
  {
    name: 'Threads',
    href: 'https://www.threads.net/',
    icon: '@',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
    icon: 'ig',
  },
]

function About() {

  return (
    <main className="min-h-screen bg-white text-neutral-900">
        <Header />

      {/* About content */}
      <section className="mx-auto grid min-h-[calc(100svh-180px)] max-w-[1600px] grid-cols-1 gap-10 px-6 pb-12 pt-10 sm:px-8 md:grid-cols-2 md:items-stretch md:gap-12 md:px-16 md:pb-0 md:pt-8">
        {/* Left: Introduction */}
        <motion.div
          className="flex flex-col justify-center py-8 md:py-16"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-5 text-xs tracking-[0.3em] text-neutral-400 uppercase">
            A Little About Me
          </p>

          <h1 className="max-w-xl text-4xl leading-tight font-light tracking-tight sm:text-5xl md:text-6xl">
            Designing with
            <br />
            <span className="bg-gradient-to-r from-[#F8D9E8] via-[#E4DDFB] to-[#D5EEFF] bg-clip-text font-semibold text-transparent">
              intention.
            </span>
          </h1>

          <div className="mt-8 max-w-lg space-y-5 text-base leading-8 text-neutral-500">
            <p>
              I’m a UX/UI designer and product thinker who enjoys exploring
              the relationship between people, technology, and the world
              around us.
            </p>

            <p>
              I approach design by observing real experiences, uncovering
              meaningful problems, and turning complex ideas into clear,
              thoughtful digital experiences.
            </p>

            <p>
              Beyond interfaces, I’m interested in the bigger picture:
              how products create value, how people connect, and how design
              can make a positive difference.
            </p>
          </div>

          {/* Resume download */}
          <IgniteButton
            href="./resume.pdf"
            download
            className="mt-8"
            >
            <span>Download Resume</span>
            <span aria-hidden="true">↓</span>
            </IgniteButton>

          {/* Social links */}
          <div className="mt-10">
            <p className="mb-4 text-xs tracking-[0.2em] text-neutral-400 uppercase">
              Find me online
            </p>

            <div className="flex flex-wrap gap-3">
            {socialLinks.map((social) => (
            <IgniteButton
                key={social.name}
                href={social.href}
                variant="circle"
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                title={social.name}
            >
                {social.icon}
            </IgniteButton>
            ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Portrait placeholder */}
        <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden md:min-h-[620px]">
          <div
            className="absolute inset-x-0 bottom-0 h-[80%] rounded-t-[48%] bg-gradient-to-b from-[#F8D9E8]/60 via-[#E4DDFB]/40 to-[#D5EEFF]/50"
            aria-hidden="true"
          />

          <div className="relative z-10 mb-10 flex h-64 w-64 items-center justify-center rounded-full border border-white/70 bg-white/40 text-sm text-neutral-400 backdrop-blur-sm sm:h-80 sm:w-80 md:mb-0 md:h-[420px] md:w-[420px]">
            Your Portrait
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default About