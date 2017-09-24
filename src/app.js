import Vue from 'vue'
import VueRouter from 'vue-router';
import App from './App.vue';
import Home from './components/Home.vue'
import Search from './components/Search.vue'
import Locations from './components/Locations.vue'

Vue.use(VueRouter)
document.addEventListener('keydown', function (e) {
  if (e.which === 116) {
    location.reload();
  }
});


var router = new VueRouter({
  routes: [
    {path: '/', component: Home, name: 'home'},
    {path: '/locations', component: Locations, name: 'locations'},
    {path: '/search', component: Search, name: 'search'}
  ]
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

router.replace('/');
window.router = router;
