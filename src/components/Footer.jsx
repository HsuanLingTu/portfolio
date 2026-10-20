import { useLocale } from '../useLocale.js'

function Footer() {
  const { t } = useLocale()
  const footer = t.footer

  return (
    <footer className="border-t border-neutral-100 px-6 py-10 sm:px-8 md:px-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-neutral-500">
          {footer.collaboration}
        </p>

        <a
          href="mailto:hsuanlingtu@gmail.com"
          className="relative z-10 w-fit text-sm underline underline-offset-4 transition hover:text-neutral-500"
        >
          {footer.contact} ↗
        </a>
      </div>

      <div className="mt-10 flex flex-col gap-2 border-t border-neutral-100 pt-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Hsuan-Ling Tu Portfolio. {footer.copyright}
        </p>
        <p>{footer.tagline}</p>
      </div>
    </footer>
  )
}

export default Footer