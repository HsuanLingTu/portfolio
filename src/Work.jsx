import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { useLocale } from './useLocale.js'
import works from './data/works.js'
import LiquidGlassCard from './components/LiquidGlassCard.jsx'

const filters = ['All', 'UX/UI', 'Graphic Design', 'Motion']

function Work() {
  const { t, isChinese } = useLocale()
  const workText = t.work
  const worksText = t.works

  const [activeFilter, setActiveFilter] = useState('All')

  const filteredWorks =
    activeFilter === 'All'
      ? works
      : works.filter((work) => work.category === activeFilter)

  const filterLabels = {
    All: workText.filters.all,
    'UX/UI': workText.filters.uxUi,
    'Graphic Design': workText.filters.graphicDesign,
    Motion: workText.filters.motion,
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Header />

      <section className="px-6 pb-24 pt-20 sm:px-8 sm:pt-24 md:px-16 md:pb-32">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="mb-5 text-xs uppercase tracking-[0.2em] text-neutral-500">
              {workText.eyebrow}
            </p>

            <h1 className="text-5xl font-light tracking-tight sm:text-6xl md:text-7xl">
              {workText.title}
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
              {workText.description}
            </p>
          </motion.div>

          <motion.div
            className="mt-12 flex gap-2 overflow-x-auto pb-2 sm:mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            role="group"
            aria-label={workText.filters.ariaLabel}
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={isActive}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  {filterLabels[filter]}
                </button>
              )
            })}
          </motion.div>

          <motion.div
            layout
            className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredWorks.map((work, index) => (
                <motion.article
                  key={work.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.04,
                    ease: 'easeOut',
                    layout: {
                      duration: 0.3,
                      ease: 'easeInOut',
                    },
                  }}
                  className="min-w-0"
                >
                  <Link
                    to={
                      work.path ||
                      `/work/${work.slug || work.id}`
                    }
                    aria-label={`${work.title} — ${
                      isChinese ? '查看作品介紹' : 'View project details'
                    }`}
                    className="block rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-neutral-900"
                  >
                    <LiquidGlassCard
                      image={work.image}
                      title={worksText[work.id]?.title ?? work.title}
                      isChinese={isChinese}
                    >
                      <div className="px-5 pb-6 pt-5 sm:px-6 sm:pb-7">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <h2 className="text-xl font-medium tracking-tight sm:text-2xl">
                            {worksText[work.id]?.title ?? work.title}
                          </h2>

                          <p className="text-xs text-neutral-400">
                            {filterLabels[work.category]} · {work.year}
                          </p>
                        </div>

                        <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">
                            {worksText[work.id]?.description ?? work.description}
                        </p>
                      </div>
                    </LiquidGlassCard>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default Work