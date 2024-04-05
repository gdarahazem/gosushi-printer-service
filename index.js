const express = require('express')
const ptp = require('pdf-to-printer')
const fs = require('fs')
const path = require('path')
const cryptoRandomString = require('crypto-random-string')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// Créer le dossier "tmp" s'il n'existe pas
const tmpDir = path.join(__dirname, 'tmp')
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir)
}

app.use(bodyParser.raw({ type: 'application/pdf', limit: '50mb' }))
app.post('', async (request, response) => {
  const options = {}
  // if (request.query.printer) {
    options.printer = 'EPSON TM-T20X Receipt'
  // }
  const randomString = cryptoRandomString({ length: 10, type: 'url-safe' })
  const tmpFilePath = path.join(tmpDir, `${randomString}.pdf`)

  try {
    fs.writeFileSync(tmpFilePath, request.body, 'binary')

    await ptp.print(tmpFilePath, options)
    fs.unlinkSync(tmpFilePath)
  } catch (error) {
    console.error('Error print to PDF', error)
  }

  response.status(204).send()
})

app.get('/printers', async (request, response) => {
  try {
    const printers = await ptp.getPrinters()
    response.json(printers)
  } catch (error) {
    console.error('Error getting printers', error)
    response.status(500).send('Erreur lors de la récupération des imprimantes.')
  }
})

app.listen(port, () => {
  console.log(`PDF Printing Service listening on port ${port}`)
})