import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { motion } from 'motion/react'
import logo from './assets/main-logo.svg'
import IgniteButton from './components/IgniteButton.jsx'
import linkedinIcon from './assets/social/linkedin.svg'
import threadsIcon from './assets/social/threads.svg'
import instagramIcon from './assets/social/instagram.svg'
import wroomIcon from './assets/social/wroom.svg'
import portrait from './assets/portrait.png'
import { useLocale } from './useLocale.js'

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/hsuanlingtu/',
    icon: linkedinIcon,
  },
  {
    name: 'Threads',
    href: 'https://www.threads.com/@hsuanlingtu',
    icon: threadsIcon,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/hsuanlingtu/',
    icon: instagramIcon,
  },
  {
    name: 'Wroom',
    href: 'https://hub.wroom.ai/en/huachong.author',
    icon: wroomIcon,
  },
]

function About() {
  const { t } = useLocale()
  const about = t.about

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
            {about.eyebrow}
          </p>

          <h1 className="max-w-xl text-4xl leading-tight font-light tracking-tight sm:text-5xl md:text-6xl">
            {about.titleFirst}
            <br />
            <span className="bg-gradient-to-r from-[#F8D9E8] via-[#E4DDFB] to-[#D5EEFF] bg-clip-text font-semibold text-transparent">
            {about.titleSecond}
            </span>
          </h1>

          <div className="mt-8 max-w-lg space-y-5 text-base leading-8 text-neutral-500">
            <p>
            {about.paragraph1}
            </p>

            <p>
            {about.paragraph2}
            </p>

            <p>
            {about.paragraph3}
            </p>
          </div>

          {/* Resume download */}
          <IgniteButton
            href={`${import.meta.env.BASE_URL}hsuanlingtu-resume.pdf`}
            download
            className="mt-8"
            >
            <span>{about.resume}</span>
            <span aria-hidden="true">↓</span>
            </IgniteButton>

          {/* Social links */}
          <div className="mt-10">
            <p className="mb-4 text-xs tracking-[0.2em] text-neutral-400 uppercase">
            {about.socialHeading}
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
                <span
                aria-hidden="true"
                className="social-logo-gradient"
                style={{
                    maskImage: `url("${social.icon}")`,
                    WebkitMaskImage: `url("${social.icon}")`,
                }}
                />
            </IgniteButton>
            ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Portrait placeholder */}
       {/* Right: Portrait */}
        <div className="relative flex min-h-[500px] items-end justify-center md:min-h-[720px]">
        {/* Background gradient shape */}
        <div
            className="absolute inset-x-0 bottom-0 h-[75%] rounded-t-[48%] bg-gradient-to-b from-[#F8D9E8]/60 via-[#E4DDFB]/40 to-[#D5EEFF]/50"
            aria-hidden="true"
        />

        {/* Portrait image */}
        <img
            src={portrait}
            alt={about.portraitAlt}
            className="relative z-10 h-[520px] w-auto max-w-none object-contain object-bottom md:h-[900px]"
        />
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default About