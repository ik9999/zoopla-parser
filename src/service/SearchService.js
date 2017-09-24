import dbPromise from './DbService.js';
import shortid from 'shortid';
import request from 'request-promise';
import xmlParser from 'xml2js';
import _ from 'lodash';

const maxInvalidTries = 4;

let queryTemplate;
let apiKey;
let delay;
let locationList = [];
let currentLocationIdx = 0;
let currentPageNum = 1;
let consecutiveInvalidTries = 0;
let isSearching;
let prc;

let onStartFn;
let onProgressFn;
let onEndFn;

let onSearchError = errorTxt => {
  consecutiveInvalidTries += 1;
  if (consecutiveInvalidTries >= maxInvalidTries) {
    setTimeout(() => {
      doSearch();
    }, delay);
  } else {
    if (onEndFn) {
      onEndFn();
      isSearching = false;
    }
    alert(errorTxt);
  }
};

let processParsedXml = (xmlObj, locationObj) => {
  let listing = _.get(xmlObj, 'response.listing');
  if (_.isArray(listing)) {
    if (listing.length > 0) {
      listing.forEach(listingObj => {
        let postcode = locationObj.postcode;
        let bedsno = _.toSafeInteger(_.get(listingObj, 'num_bedrooms[0]'));
        let priceStr = _.get(listingObj, 'rental_prices[0].per_month[0]');
        let propertyType = _.get(listingObj, 'property_type[0]', '');
        let sharedOccupancy = _.get(listingObj, 'rental_prices[0].shared_occupancy[0]', '');
        let price;
        if (priceStr) {
          price = _.toNumber(priceStr);
        }
        let url = _.get(listingObj, 'details_url[0]');
        if (postcode && _.isNumber(bedsno) && price && price > 0 && url) {
          let id = shortid.generate();
          dbPromise.then(db => {
            db.get('results').push({
              id,
              postcode,
              bedsno,
              price,
              url,
              propertyType,
              sharedOccupancy
            }).write();
          });
        } else {
          console.log(listingObj);
          console.log(postcode, bedsno, price, url);
        }
      });
      dbPromise.then(db => {
        db.write();
      });
      return true;
    }
  }
  return false;
};

let doSearch = () => {
  console.log('doSearch');
  if (currentLocationIdx < locationList.length) {
    let locationObj = locationList[currentLocationIdx];
    let query = queryTemplate.replace('{pagenum}', currentPageNum).replace('{apikey}', apiKey);
    query = query.replace('{postCode}', locationObj.postcode);
    console.log('query', query);
    request(query).then(xmlString => {
      xmlParser.parseString(xmlString, (xmlError, xmlObj) => {
        if (!xmlError) {
          console.log(xmlObj);
          if (xmlObj) {
            let wasXmlProccessed = processParsedXml(xmlObj, locationObj);
            if (wasXmlProccessed) {
              currentPageNum += 1;
            } else {
              currentLocationIdx += 1;
              currentPageNum = 1;
              if (onProgressFn) {
                prc = _.toSafeInteger(currentLocationIdx * 100 / locationList.length);
                onProgressFn(prc);
              }
            }
            setTimeout(() => {
              doSearch();
            }, delay);
          }
        } else {
          console.log(xmlError);
          onSearchError('Error parsing xml');
        }
      });
    }).catch(requestError => {
      console.log(requestError);
      if (requestError && requestError.error) {
        xmlParser.parseString(requestError.error, (xmlError, xmlObj) => {
          if (!xmlError) {
            console.log(xmlObj);
            let error = _.get(xmlObj, 'response.error_string[0]');
            if (error) {
              onSearchError('Location: ' + locationObj.postcode + '. Error making the request.' + error);
              console.log(error, error.indexOf('Unknown location'));
              if (_.isString(error) && error.indexOf('Unknown location') > -1) {
                currentLocationIdx += 1;
                currentPageNum = 1;
                if (onProgressFn) {
                  prc = _.toSafeInteger(currentLocationIdx * 100 / locationList.length);
                  onProgressFn(prc);
                }
                setTimeout(() => {
                  doSearch();
                }, delay);
              }
            } else {
              onSearchError('Location: ' + locationObj.postcode + '. Error making the request');
            }
          } else {
            onSearchError('Location: ' + locationObj.postcode + '. Error making the request');
          }
        });
      } else {
        onSearchError('Location: ' + locationObj.postcode + '. Error making the request');
      }
    });
  } else {
    if (onProgressFn) {
      prc = 100;
      onProgressFn(prc);
    }
    if (onEndFn) {
      onEndFn();
      isSearching = false;
    }
  }
};

let searchManager = {
  start() {
    if (!isSearching) {
      prc = 0;
      dbPromise.then(db => {
        apiKey = db.get('config.apiKey').value();
        queryTemplate = db.get('config.queryTemplate').value();
        delay = db.get('config.delay').value();
        locationList = db.get('locations').value();
        if (apiKey && delay && queryTemplate) {
          if (locationList && locationList.length > 0) {
            currentLocationIdx = 0;
            currentPageNum = 1;
            isSearching = true;
            dbPromise.then(db => {
              db.set('results', []).write();
              if (onStartFn) {
                onStartFn();
              }
            });
            doSearch();
          } else {
            alert('add postcodes');
          }
        } else {
          alert('enter apiKey/delay');
        }
      });
    } else {
      alert('Already searching');
    }
  },
  getPercentage() {
    return prc;
  },
  getIsSearching() {
    return isSearching;
  },
  stop() {
    isSearching = false;
  },
  onStart: function(fn) {
    if (typeof fn === 'function') {
      onStartFn = fn;
    }
  },
  onProgress: function(fn) {
    if (typeof fn === 'function') {
      onProgressFn = fn;
    }
  },
  onEnd: function(fn) {
    if (typeof fn === 'function') {
      onEndFn = fn;
    }
  }
};

export default searchManager;
