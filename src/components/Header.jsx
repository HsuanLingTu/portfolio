import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import logo from '../assets/main-logo.svg'

const navLinks = [
  { label: 'Work', to: '/work' },
  { label: 'Case Study', to: '/case-study' },
  { label: 'About', to: '/about' },
]

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `whitespace-nowrap transition hover:text-black ${
      isActive ? 'text-neutral-900' : 'text-neutral-500'
    }`

  const mobileLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-3.5 text-sm transition hover:bg-neutral-50 hover:text-black ${
      isActive
        ? 'bg-neutral-50 text-neutral-900'
        : 'text-neutral-600'
    }`

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-5 sm:px-8 md:px-16 md:py-6">
      <Link
        to="/"
        className="inline-flex shrink-0 items-center"
        aria-label="Go to homepage"
        onClick={() => setMobileMenuOpen(false)}
      >
        <img
          src={logo}
          alt="Personal logo"
          className="h-12 w-auto sm:h-14"
        />
      </Link>

      {/* Desktop navigation */}
      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-6 text-sm md:flex"
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end
            className={linkClass}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile menu button */}
      <button
        type="button"
        className="relative z-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 md:hidden"
        aria-label={
          mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
        }
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <span className="sr-only">
          {mobileMenuOpen ? 'Close menu' : 'Open menu'}
        </span>

        <span
          className="flex w-5 flex-col items-center gap-[5px]"
          aria-hidden="true"
        >
          <span
            className={`h-[1.5px] w-5 rounded-full bg-current transition-transform duration-200 ${
              mobileMenuOpen ? 'translate-y-[3.25px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-[1.5px] w-5 rounded-full bg-current transition duration-200 ${
              mobileMenuOpen ? 'scale-x-0 opacity-0' : ''
            }`}
          />
          <span
            className={`h-[1.5px] w-5 rounded-full bg-current transition-transform duration-200 ${
              mobileMenuOpen
                ? '-translate-y-[9.75px] -rotate-45'
                : ''
            }`}
          />
        </span>
      </button>

      {/* Mobile dropdown */}
      <div
        id="mobile-navigation"
        className={`absolute top-full right-6 left-6 overflow-hidden rounded-2xl border border-neutral-100 bg-white/95 shadow-lg shadow-neutral-900/5 backdrop-blur-xl transition-all duration-200 md:hidden sm:right-8 sm:left-8 ${
          mobileMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-2 pointer-events-none opacity-0'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex flex-col p-3"
        >
          {navLinks.map((link, index) => (
            <NavLink
              key={link.label}
              to={link.to}
              end
              tabIndex={mobileMenuOpen ? 0 : -1}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${mobileLinkClass({ isActive })} ${
                  index !== navLinks.length - 1
                    ? 'border-b border-neutral-100'
                    : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
