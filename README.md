# Pelias PIP Test

This is a little script to test the Pelias PIP service against OpenAddresses data.

## Setup instructions

1. Download data, for example :
   ```
   wget https://results.openaddresses.io/latest/run/au/countrwide.zip
   unzip countrywide.zip
   ```
2. Start Pelias PIP service (use [pelias/dockerfiles](https://github.com/pelias/docker/))

3. `npm install`
4. `node run_test.js > out.csv`

   Progress (number of completed records, number of match with normal PIP request, number of matches querying locality layer directly) will be printed to stderr.
   The output CSV will contain more complete information.
