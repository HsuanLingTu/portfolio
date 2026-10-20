function Footer() {
    return (
      <footer className="border-t border-neutral-100 px-6 py-10 sm:px-8 md:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-500">
            Open to meaningful collaborations.
          </p>
  
          <a
            href="mailto:hsuanlingtu@gmail.com"
            className="w-fit text-sm underline underline-offset-4 transition hover:text-neutral-500"
          >
            Get in touch ↗
          </a>
        </div>
  
        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-100 pt-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Hsuan-Ling Tu. All rights reserved.
          </p>
          <p>Designed with intention.</p>
        </div>
      </footer>
    )
  }
  
  export default Footer
  