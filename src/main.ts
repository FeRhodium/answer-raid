import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { applyThemeAttr } from './lib/theme.svelte.ts'
import { applyDocumentLang } from './lib/i18n.svelte.ts'

// 在挂载前先把 data-theme / lang 写到 <html> 上,避免首帧闪一下默认配色
applyThemeAttr()
applyDocumentLang()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
