var express = require('express');
var Busboy = require('busboy');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var engine = require('ejs-mate');

var app = express();


// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs'); // so you can render('index')

app.use(express.static( path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.listen(55555, function(){
    console.log('this server is running on the port ' + this.address().port);
});

// Define our route for uploading files
app.post('/upload', function (req, res) {
    if (req.method === 'POST') {

        var filename_; var path_; var length_=0;
        // Create an Busyboy instance passing the HTTP Request headers.
        var busboy = new Busboy({ headers: req.headers });

        // Listen for event when Busboy finds a file to stream.
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            //console.log(arguments);
            // We are streaming! Handle chunks
            file.on('data', function (data) {
                // Here we can act on the data chunks streamed.
                length_ += data.length;
                //console.log(data.length, ' ' , length_);
            });
             // Completed streaming the file.

            file.pipe(fs.createWriteStream(path.join(__dirname, 'public', filename)));

            file.on('end', function () {
                console.log('Finished with ' + fieldname);
                path_=path.join(__dirname, 'public', filename);
                filename_=filename;

            });
        });  //end busboy

        // Listen for event when Busboy finds a non-file field.
        busboy.on('field', function (fieldname, val) {
            // Do something with non-file field.
            console.log(fieldname, val);
            filename_=val;
        });

        // Listen for event when Busboy is finished parsing the form.
        busboy.on('finish', function () {
            res.statusCode = 200;
            res.render('upload', {
                file_name: filename_,
                file_length: length_
            });

        });

        // Pipe the HTTP Request into Busboy.
        req.pipe(busboy);

    }
});
