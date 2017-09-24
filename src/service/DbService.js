const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const adapter = new FileAsync('db.json');
const _dbPromise = lowdb(adapter);

let dbPromise = new Promise(resolve => {
  _dbPromise.then(db => {
    db.defaults({locations: [], results: [], config: {
      apiKey: '',
      delay: 1000,
      queryTemplate: 'http://api.zoopla.co.uk/api/v1/property_listings.xml?&listing_status=rent&furnished=furnished&page_size=100&page_number={pagenum}&api_key={apikey}&postcode={postCode}&maximum_beds=4'
    }}).write().then(() => {
      resolve(db);
    });
  })
});

export default dbPromise;
