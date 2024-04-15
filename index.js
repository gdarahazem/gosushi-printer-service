const express = require('express');
const ptp = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
const cryptoRandomString = require('crypto-random-string');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create the "tmp" folder if it does not exist
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

app.use(bodyParser.raw({ type: 'application/pdf', limit: '50mb' }));

app.post('', async (request, response) => {
  // Define an array with the printer names
  const printerNames = [
    'EPSON TM-T20X Receipt',
    // 'EPSON TM-T20X Receipt',
    // 'EPSON TM-T20X Receipt'
  ];

  const randomString = cryptoRandomString({ length: 10, type: 'url-safe' });
  const tmpFilePath = path.join(tmpDir, `${randomString}.pdf`);

  try {
    fs.writeFileSync(tmpFilePath, request.body, 'binary');

    // Loop through the printer names and send the print job to each one
    for (const printerName of printerNames) {
      const options = {
        printer: printerName
      };

      console.log(`Sending print job to ${printerName}`);
      await ptp.print(tmpFilePath, options);
    }

    // Delete the temporary file after printing to all printers
    fs.unlinkSync(tmpFilePath);

    response.status(200).json({ message: 'Print job successfully completed on all printers.' });
  } catch (error) {
    console.error('Error print to PDF', error);
    // If there's an error, it's a good idea to attempt to delete the temporary file
    if (fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath);
    }
    response.status(500).json({ error: 'Failed to print PDF', details: error.message });
  }
});
app.get('/printers', async (request, response) => {
  try {
    const printers = await ptp.getPrinters();
    response.json(printers);
  } catch (error) {
    console.error('Error getting printers', error);
    response.status(500).send('Erreur lors de la récupération des imprimantes.');
  }
});

app.listen(port, () => {
  console.log(`PDF Printing Service listening on port ${port}`);
});
