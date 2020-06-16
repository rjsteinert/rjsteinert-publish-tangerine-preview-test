async function run() {
    console.log("I'm running!")
    const report1 = document.querySelector('#report1');
    report1.innerHTML += '<h2>Itemized Report</h2>'
    let options = {include_docs: true, reduce: false, descending: true}
    let results;
    // TODO: remove this when finished with debugging
    // window['userDb']  = await window.userService.getUserDatabase('admin')
    try {
        results = await window.userDb.db.query('registrationResults', options);
        const docs = results.rows.map(row => row.doc)
        console.log("docs: " + JSON.stringify(docs))
        for (const doc of docs) {
          report1.innerHTML += `<p>${doc._id}: ${doc.items[0].inputs[0].value} ${doc.items[0].inputs[1].value}</p>`
        }
    } catch (e) {
        console.log("Error: " + JSON.stringify(e))
    }
    const report2 = document.querySelector('#report1');
    report2.innerHTML += '<h2>Summary Report</h2>'
    options = {reduce: true}
    try {
      results = await window.userDb.db.query('registrationResults', options);
      const docs = results.rows.map(row => row.value)
      console.log("docs: " + JSON.stringify(docs))
      report1.innerHTML += `<p>Consent: Yes: ${docs[0][0]} No: ${docs[0][1]} </p>`
    } catch (e) {
      console.log("Error: " + JSON.stringify(e))
    }
}

run().then(r => console.log('done!'))