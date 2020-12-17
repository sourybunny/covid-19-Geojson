import Vue from 'vue'
import App from './App.vue'
import VueCommaFilter from "vue-comma-filter";
 
Vue.use(VueCommaFilter)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
