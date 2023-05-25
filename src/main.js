import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
import * as echarts from "echarts"; // 全局引入Echarts，首先引入
import "echarts/map/js/china";
Vue.prototype.$echarts = echarts; // 然后挂载在vue原型上
// 饿了么ui组件
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.use(ElementUI);

// 自定义指令
import "@/utils/directives";
// ...
// import "postcss-px-to-viewport";
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
