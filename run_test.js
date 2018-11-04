const fs = require('fs');
const parse = require('csv-parse');
const through = require('through2');
const request = require('request-promise-native');
const _ = require('lodash');
const http = require('http');
const parallel = require('parallel-transform');

http.globalAgent = new http.Agent({
  keepAlive: true
});

const parser = parse({
  columns: true
});

const file = './countrywide.csv';

function getPlainURL(lat, lon) {
  return `http://localhost:4200/${lon}/${lat}`;
}

function getLocalityURL(lat, lon) {
  return `${getPlainURL(lat,lon)}?layers=locality`;
}

function getLocalityFromResponse(response) {
  const object = JSON.parse(response);
  return _.get(object, 'locality[0].name');
}

function localitiesAreEqual(loc1, loc2) {
  if (!loc1 || !loc2) {
    return false;
  }

  //remove trailing words in parens
  loc1 = loc1.replace(/\(.+\)/,'').trim();
  loc2 = loc2.replace(/\(.+\)/,'').trim();

  return loc1.toLowerCase() === loc2.toLowerCase();
}

let match1 = 0;
let match2 = 0;
let total = 0;

function percent(num, denom) {
  return Math.round(num/denom*100);
}


async function run(row, next) {
  const expected_locality = row.CITY;

  const requests = [ request(getPlainURL(row.LAT, row.LON)),
                      request(getLocalityURL(row.LAT, row.LON)) ];

  const responses = await Promise.all(requests);
  const locality1 = getLocalityFromResponse(responses[0]);
  const locality2 = getLocalityFromResponse(responses[1]);
  const isMatch1 = localitiesAreEqual(expected_locality, locality1);
  const isMatch2 = localitiesAreEqual(expected_locality, locality2);

  total++;

  if (isMatch1) {
    match1++;
  }

  if (isMatch2) {
    match2++;
  }

  if (total % 100 == 0) {
    console.error(`${total} ${match1}(${percent(match1,total)}) ${match2}(${percent(match2,total)})`);
  }
  console.log(`${row.LAT},${row.LON},${expected_locality},${locality1},${locality2},${isMatch1},${isMatch2}`);
  next();
};



console.log('lat,lon,expected,locality1,locality1,match1,match2');

fs.createReadStream(file).pipe(parser).pipe(parallel(10, run));
