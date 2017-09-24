<template>
  <header class="toolbar toolbar-header">
    <h1 class="title WindowHeader-title">
      Zoopla parser
      <span
        class="icon icon-record WindowHeader-roundButton WindowHeader-roundButton--close float-right mr-1"
        @click="closeWindow"
      >
      </span>
      <span
        class="icon icon-record WindowHeader-roundButton WindowHeader-roundButton--max float-right mr-1"
        @click="resizeWindow"
      >
      </span>
      <span
        class="icon icon-record WindowHeader-roundButton WindowHeader-roundButton--min float-right mr-1"
        @click="minimizeWindow"
      >
      </span>
    </h1>

    <div class="toolbar-actions">
      <div class="btn-group">
        <button
          class="btn btn-default" :class="{active: ($route.name == 'home')}"
          @click="$router.push('/')"
        >
          <span class="icon icon-home icon-text"></span>
          Home
        </button>
        <button
          class="btn btn-default" :class="{active: ($route.name == 'locations')}"
          @click="$router.push('/locations')"
        >
          <span class="icon icon-compass icon-text"></span>
          Locations
        </button>
        <button
          class="btn btn-default" :class="{active: ($route.name == 'search')}"
          @click="$router.push('search')"
        >
          <span class="icon icon-search icon-text"></span>
          Search
        </button>
      </div>
    </div>
  </header>
</template>

<script>
const ipc = require('electron').ipcRenderer;

export default {
  methods: {
    closeWindow() {
      ipc.send('close');
    },
    resizeWindow() {
      ipc.send('resize');
    },
    minimizeWindow() {
      ipc.send('resize');
    }
  }
}
</script>

<style>
.WindowHeader-roundButton--close {
  color: #fc605b;
}

.WindowHeader-roundButton--max {
  color: #fdbc40;
}

.WindowHeader-roundButton--min {
  color: #34c84a;
}

.WindowHeader-roundButton {
  cursor: pointer;
  font-size: 1.05rem;
}

.WindowHeader-title {
  font-size: 15px;
}
</style>

