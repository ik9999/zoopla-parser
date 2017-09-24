<template>
  <div class="p-2 container-fluid">
    <form>
      <div class="form-group">
        <label>Api key</label>
        <input
          type="text" class="form-control" v-model="apiKey" placeholder="Api key"
          @input="apiKeyChange"
        >
      </div>
      <div class="form-group">
        <label>Delay between search queries (milliseconds)</label>
        <input
          type="number" class="form-control" placeholder="1000" v-model.number="delay"
          @input="timeoutChange"
        >
      </div>
      <div class="form-group">
        <label>Query template</label>
        <input
          type="text" class="form-control" placeholder="" v-model="queryTemplate"
          @input="queryTemplateChange"
        >
      </div>
      <div class="form-actions">
        <button
          type="submit" class="btn btn-form btn-primary" @click.prevent="search"
          v-show="!isSearching"
        >
          Search
        </button>
        <button
          type="submit" class="btn btn-form btn-default" @click.prevent="cancelSearch"
          v-show="isSearching"
        >
          Stop search
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import dbPromise from './../service/DbService.js';
import searchManager from './../service/SearchService.js';

export default {
  data() {
    return {
      apiKey: '',
      delay: 1000,
      isSearching: false,
      queryTemplate: ''
    };
  },
  mounted () {
    this.isSearching = searchManager.getIsSearching();
    dbPromise.then(db => {
      this.apiKey = db.get('config.apiKey').value();
      this.delay = db.get('config.delay').value();
      this.queryTemplate = db.get('config.queryTemplate').value();
    });
  },
  methods: {
    search() {
      this.isSearching = true;
      searchManager.start();
    },
    cancelSearch() {
      this.isSearching = false;
      searchManager.stop();
    },
    apiKeyChange() {
      dbPromise.then(db => {
        db.set('config.apiKey', this.apiKey).write();
      });
    },
    timeoutChange() {
      dbPromise.then(db => {
        db.set('config.delay', this.delay).write();
      });
    },
    queryTemplateChange() {
      dbPromise.then(db => {
        db.set('config.queryTemplate', this.queryTemplate).write();
      });
    }
  }
}
</script>

<style>
</style>
