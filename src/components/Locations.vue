<template>
  <div class="p-2 container-fluid">
    <form class="Locations-form">
      <div class="form-group Locations-descriptionContainer">
        <label>Postal codes (one per line)</label>
        <textarea class="form-control Locations-textarea" @input="change" v-model="postalCodesStr"></textarea>
      </div>
    </form>
  </div>
</template>

<script>
import dbPromise from './../service/DbService.js';

let saveCodesToDb = postalCodesStr => {
  let postalCodeList = [];
  if (typeof postalCodesStr === 'string' && postalCodesStr.length > 0) {
    postalCodeList = postalCodesStr.split('\n');
    let locationObjList = postalCodeList.map(code => {
      return {
        postcode: code.trim()
      };
    });
    locationObjList = locationObjList.filter(locationObj => {
      return locationObj.postcode != '';
    });
    dbPromise.then(db => {
      db.set('locations', locationObjList).write();
    });
  }
};

export default {
  methods: {
    change() {
      saveCodesToDb(this.postalCodesStr);
    }
  },
  data() {
    return {
      postalCodesStr: ''
    };
  },
  created() {
    dbPromise.then(db => {
      this.postalCodesStr = db.get('locations').map(locationObj => {
        return locationObj.postcode;
      }).join('\n').value();
    });
  }
}
</script>

<style>
.Locations-textarea {
  width: 100%;
  height: calc(100% - 34px);
}

.Locations-form {
  height: 100%;
  margin-bottom: 0px;
}

.Locations-descriptionContainer {
  height: 100%;
  margin-bottom: 0px;
}
</style>
