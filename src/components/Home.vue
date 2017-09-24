<template>
  <div class="p-2 container-fluid">
    <h3 class="Home-searchTitle text-center">Search progress</h3>
    <div class="progress">
      <div
        class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="75" aria-valuemin="0"
        aria-valuemax="100" :style="{ width: progressPrc + '%' }"
      ></div>
    </div>
    <h3 class="Home-searchingTitle text-center" v-show="searchResultObjList.length > 0">Search results</h3>
    <div class="Home-tableCont">
      <table class="table table-bordered table-fixed Home-table" v-show="searchResultObjList.length > 0">
        <thead>
          <tr>
            <th class="Home-tableCell Home-tableCell--area">Area/Postcode</th>
            <th class="Home-tableCell Home-tableCell--beds">No. Beds</th>
            <th class="Home-tableCell Home-tableCell--price">Monthly Price</th>
            <th class="Home-tableCell Home-tableCell--propertyType">Property Type</th>
            <th class="Home-tableCell Home-tableCell--sharedOccupancy">Shared Occupancy</th>
            <th class="Home-tableCell Home-tableCell--link">Link to Property</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="searchResultObj in searchResultObjList" :key="searchResultObj.id">
            <td class="Home-tableCell Home-tableCell--area" v-text="searchResultObj.postcode"></td>
            <td class="Home-tableCell Home-tableCell--beds" v-text="searchResultObj.bedsno"></td>
            <td class="Home-tableCell Home-tableCell--price" v-text="searchResultObj.price"></td>
            <td class="Home-tableCell Home-tableCell--propertyType" v-text="searchResultObj.propertyType"></td>
            <td class="Home-tableCell Home-tableCell--sharedOccupancy" v-text="searchResultObj.sharedOccupancy">
            </td>
            <td class="Home-tableCell Home-tableCell--link" v-text="searchResultObj.url"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      class="btn btn-large btn-primary" v-show="searchResultObjList.length > 0"
      @click.prevent="saveToCSV"
    >
      Export to CSV
    </button>
  </div>
</template>

<script>
import json2csv from 'json2csv';
import fs from 'fs';
import searchManager from './../service/SearchService.js';
import dbPromise from './../service/DbService.js';

const {dialog} = require('electron').remote;

export default {
  data() {
    return {
      searchResultObjList: [],
      progressPrc: 0
    }
  },
  created() {
    this.progressPrc = searchManager.getPercentage();
    dbPromise.then(db => {
      this.searchResultObjList = db.get('results').value();
    });
    searchManager.onStart(() => {
      this.progressPrc = 1;
      this.updateResults();
    });
    searchManager.onProgress(prc => {
      this.updateResults();
      this.progressPrc = prc;
    });
    searchManager.onEnd(() => {
      this.progressPrc = 100;
      this.updateResults();
    });
  },
  methods: {
    updateResults: () => {
      dbPromise.then(db => {
        this.searchResultObjList = db.get('results').value();
      });
    },
    saveToCSV: () => {
      dbPromise.then(db => {
        dialog.showSaveDialog({
          title: 'CSV file',
          defaultPath: 'zoopla_report.csv'
        }, filename => {
          let csv = json2csv({
            data: db.get('results').value(),
            fields: ['postcode', 'bedsno', 'price', 'propertyType', 'sharedOccupancy', 'url'],
            fieldNames: [
              'Area/Postcode', 'No. Beds', 'Monthly Price', 'Property Type', 'Shared Occupancy', 'Link to Property'
            ]
          });
          fs.writeFile(filename, csv, function(err) {
            if (err) throw err;
            alert('File saved');
          });
        });
      });
    }
  }
}
</script>

<style>
.Home-searchTitle {
  margin-top: 0px;
}

.Home-searchResults {
  margin-top: 0px;
}

.Home-tableCont {
  margin-top: 15px;
  height: calc(100% - 140px);
  width: 100%;
  overflow: scroll;
}

.Home-tableCell {
  word-break: break-all;
  white-space: normal;
}

.Home-tableCell--area {
  width: 20%;
}

.Home-tableCell--beds {
  width: 10%;
}

.Home-tableCell--price {
  width: 10%;
}

.Home-tableCell--link {
  width: 40%;
}

.Home-tableCell--propertyType {
  width: 10%;
}

.Home-tableCell--sharedOccupancy {
  width: 10%;
}
</style>
