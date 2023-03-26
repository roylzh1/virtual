import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '/router.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia()).use(ElementPlus).use(router).mount('#app');