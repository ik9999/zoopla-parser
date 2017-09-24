<template>
  <div class="window">
    <window-header></window-header>
    <div class="window-content">
      <router-view></router-view>
    </div>
    <footer class="toolbar toolbar-footer">
    </footer>
  </div>
</template>

<script>
import WindowHeader from './components/WindowHeader.vue'
import Db from './service/DbService.js'

export default {
  data() {
    return {
      msg: 'Welcome to Electron & Vue.js World!'
    }
  },
  components: {
    WindowHeader
  }
}
</script>

<style>
.container {
  text-align: center;
  margin: 0 auto;
  padding-top: 70px;
}
</style>
