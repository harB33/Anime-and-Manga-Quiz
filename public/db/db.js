const express = require('express');
const app = express();
const fs = require('fs');
const phpBin = fs.existsSync('C:\\xampp\\php\\php.exe') ? 'C:\\xampp\\php\\php.exe' : 'php'
const phpExpress = require('php-express')({ binPath: phpBin }); // Path to your php executable

// Set up the PHP engine
app.engine('php', phpExpress.engine);
app.set('views', './views'); // Directory for your PHP files
app.set('view engine', 'php');

// Route all .php requests to the php-express router
app.all(/.+\.php$/, phpExpress.router);

app.listen(3000, () => console.log('Server running on port 3000'));