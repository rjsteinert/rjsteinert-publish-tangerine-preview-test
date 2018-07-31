#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('  ./batch.js <statePath> > <outputPath>  ')
  process.exit()
}

const util = require('util');
const axios = require('axios')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const appendFile = util.promisify(fs.appendFile);
const CSV = require('comma-separated-values')
const PouchDB = require('pouchdb')

const params = {
  statePath: process.argv[2]
}

function getData(url, dbName, formId, skip, batchSize) {
  const limit = batchSize
  return new Promise((resolve, reject) => {
    try {
      const target = `${url}/${dbName}/_design/tangy-reporting/_view/resultsByGroupFormId?keys=["${formId}"]&include_docs=true&skip=${skip}&limit=${limit}`
      console.log(target)
      axios.get(target)
        .then(response => resolve(response.data.rows.map(row => row.doc)))
        .catch(err => reject(err));
    } catch (err) {
      console.log(err)
    }
  });
}

async function batch() {
  const state = JSON.parse(await readFile(params.statePath))
  const DB = PouchDB.defaults(Object.assign({}, state.dbDefaults, {timeout: 50000}))
  const db = new DB(state.dbName)
  const docs = await getData(state.dbDefaults.prefix, state.dbName, state.formId, state.skip, state.batchSize)
  if (docs.length === 0) {
    state.complete = true
  } else {
    // Order each datum's properties by the headers for consistent columns.
    const rows = docs.map(doc => [ doc._id, ...state.headersKeys.map(header => (doc.processedResult[header]) ? doc.processedResult[header] : '') ])
    const output = `\n${new CSV(rows).encode()}`
    await appendFile(state.outputPath, output)
    state.skip = state.skip + state.batchSize
  }
  await writeFile(state.statePath, JSON.stringify(state), 'utf-8')
  process.exit()
}
batch()
