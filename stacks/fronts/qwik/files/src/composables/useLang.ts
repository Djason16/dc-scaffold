import { useContext } from '@builder.io/qwik'
import { LangContext } from '~/plugins/lang'

// Language of plugins/lang.ts, in any component:  const lang = useLang()  then  t(lang, 'home')  and  lang.current
export const useLang = () => useContext(LangContext)
