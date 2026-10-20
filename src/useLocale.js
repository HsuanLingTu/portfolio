import { useLocation, useNavigate } from 'react-router'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'

const translations = {
  en,
  'zh-TW': zhTW,
}

export function useLocale() {
  const location = useLocation()
  const navigate = useNavigate()

  const isChinese = location.pathname === '/zh-tw' ||
    location.pathname.startsWith('/zh-tw/')

  const locale = isChinese ? 'zh-TW' : 'en'
  const t = translations[locale]

  function switchLocale() {
    let nextPath

    if (isChinese) {
      nextPath = location.pathname.replace(/^\/zh-tw(?=\/|$)/, '') || '/'
    } else {
      nextPath = `/zh-tw${location.pathname === '/' ? '/' : location.pathname}`
    }

    navigate(nextPath + location.search + location.hash)
  }

  return {
    locale,
    t,
    isChinese,
    switchLocale,
  }
}
