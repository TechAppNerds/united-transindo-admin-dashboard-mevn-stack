const express = require("express");
const app = express();
// const router = express.Router();
const bodyParser = require("body-parser");
const { readFile } = require("fs");
const { google } = require("googleapis");
const secretKey = require("./ut-database-center-c0e311032c53.json");
const { client_email, private_key } = secretKey;
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
var db;
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(`${__dirname}/assets`));
// const model = require('./models');
const axios = require('axios').default;
const fs = require('fs');
const morgan = require('morgan');
const multer = require('multer');
// const http = require('http');
// app.use(express.urlencoded({extended : false}));
// app.use(express.json())

// support parsing of application/x-www-form-urlencoded post data
// app.use(bodyParser.urlencoded({ extended: true }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// support parsing of application/json type post data
app.use(bodyParser.json());

// for parsing multipart/form-data
app.use(multer().array());

const PORT = process.env.PORT || 3000;
// const server = http.createServer()
require('dotenv').config();


// mongoose
// .connect("mongodb://localhost:27017/united-transindo")
// .then(() => {
//   console.log('Connected to MongoDB');
//   app.listen(PORT, (err) => {
//     if (err) {
//       return console.log("ERROR", err);
//     }
//     console.log(`Node API App is running on port ${PORT}`);
//   });
// }).catch((error) => {
//   console.log(error)
// });

// // let db = mongoose.connection;
// mongoose.connection.on("error", console.error.bind(console, "MongoDB Connection Error"));

// console.log("MongoClient = ", MongoClient)



// const mongoClient = new MongoClient(url);

// mongoClient.connect((err) => {
//   if (err) throw err;

//   // Available via req.app.locals.db.
//   app.locals.db = mongoClient.db(dbName);

//   // app.listen(3000); 
// });

// let jobOrderCollection;

// async function main() {
//   await client.connect();         
//   console.log('Connected successfully to server');

//   db = client.db(dbName);
//   // jobOrderCollection = db.collection('job-order');
// }

// main().then(console.log)
//              .catch(console.error)
//               .finally(() => client.close());

// Connection URL
const url = 'mongodb://localhost:27017';                                    
const client = new MongoClient(url);

const dbName = 'united-transindo';

mongoose
  .connect("mongodb://localhost:27017/united-transindo")
  .then(async () => {
    console.log('Connected to MongoDB');
    await client.connect();         
    console.log('Connected successfully to server');
    db = client.db(dbName);
    app.listen(PORT, (err) => {
      if (err) {
        return console.log("ERROR", err);
      }
      console.log(`Node API App is running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error(error)
  }).finally(() => client.close());

// let db = mongoose.connection;
mongoose.connection.on("error", console.error.bind(console, "MongoDB Connection Error"));

// const myModule = require("./my-module");

// app.use((req, res, next) => {
//   if (req.path === '/marketing') app.set('views', './views2');
//   else app.set('views', __dirname + '/views');
//   next()
// })

app.use(morgan((tokens, req, res) => {
  return [`Method:${tokens.method(req, res)}; URL:${tokens.url(req, res)}; Status:${tokens.status(req, res)}; Message: ${res.statusMessage}; DateTime: ${(new Date().getDate() < 10 ? "0" : "") + new Date().getDate() + '/' + ((new Date().getMonth() + 1 < 10 ? "0" : "") + (new Date().getMonth() + 1)) + '/' + new Date().getFullYear()}; ResponseTime: ${Math.floor(tokens['response-time'](req, res))} ms`].join(' ')
},{stream:fs.createWriteStream('./logger.log', {flags:'a'},)}));

const dir = './images', storage = multer.diskStorage({
  destination:function(req,file,callback){
      callback(null, dir);
  },
  filename:async function(req,file,callback){
      const extension = file.originalname.split('.')[file.originalname.split('.').length-1];
      const filename = req.developer.username;
      isFileExist(filename)
      callback(null,(filename+'.'+extension));
  }
});

function checkFileType(file,cb) {
  const filetypes= /jpeg|jpg|png|gif/;
  const extname=filetypes.test(file.originalname.split('.')[file.originalname.split('.').length-1]);
  const mimetype=filetypes.test(file.mimetype);
  if (mimetype && extname) {
      return cb(null,true);
  } else {
      cb(error = 'Error : Image Format Type Only');
  }
}

function isFileExist(filename) {
  let arr_files = []
  fs.readdirSync(`${__dirname}\\images`).forEach(file => {
      arr_files.push(file)
  })
  arr_files.forEach(file => {
      if (filename == file.split(".")[0]) {
          fs.unlinkSync(`${__dirname}\\images\\${file}`)
      }
  })
}

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
  }
});

// async function GoogleSheetAPIAuth() {
//   let jwtClient = new google.auth.JWT(
//     client_email,
//     null,
//     private_key,
//     ['https://www.googleapis.com/auth/spreadsheets']);
  
//   //authenticate request
//   jwtClient.authorize((err, tokens) => {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       console.log("Successfully connected!");
//     }
//   });
// }

async function readGoogleSheet(sheet) {
  // let secretKey = require("./ut-database-center-c0e311032c53.json"), 
  let jwtClient = new google.auth.JWT(
         client_email,
         null,
         private_key,
         ['https://www.googleapis.com/auth/spreadsheets']);
  //authenticate request
  jwtClient.authorize((err, tokens) => {
   if (err) {
     console.log(err);
     return;
   } else {
     console.log("Successfully connected!");
   }
  });
  //Google Sheets API
  let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
      // sheetRange =  sheet === "database" ? 'DATABASE 2024!A1:AQ' : 'Kode Rute!A1:Z',
      sheetRange,
      sheets = google.sheets('v4');

  if (sheet === "database") {
    sheetRange = 'DATABASE 2024!A:AQ';
  } else if (sheet === "nama pengirim") {
    sheetRange = 'Nama Pengirim!A:A';
  } else if (sheet === "alamat pengirim") {
    sheetRange = 'Alamat Pengirim!A:A';
  } else if (sheet === "kontak pengirim") {
    sheetRange = 'Kontak Pengirim!A:A';
  } else if (sheet === "nama penerima") {
    sheetRange = 'Nama Penerima!A:A';
  } else if (sheet === "alamat penerima") {
    sheetRange = 'Alamat Penerima!A:A';
  } else if (sheet === "kontak penerima") {
    sheetRange = 'Kontak Penerima!A:A';
  } else if (sheet === "merk") {
    sheetRange = 'Merk!A:A';
  } else if (sheet === "type") {
    sheetRange = 'Type!A:A';
  } else if (sheet === "warna") {
    sheetRange = 'Warna!A:A';
  } else if (sheet === "nopol noka") {
    sheetRange = 'Nopol Noka!A:A';
  } else {
    // Kode Rute
    sheetRange = 'Kode Rute!A:B';
  }
  return await sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
    range: sheetRange
  }).then((response) => {
    if (sheet === "database") {
      let results = response.data.values, 
          headerIndex = getIndexOfItem(results, "NO. JOJ")[0], 
          headerTable = results.slice(headerIndex).shift(), 
          contentTable = [];

      // console.log(results[2]);

      // console.log(getIndexOfItem(results, "NO. SJ")[0]);
      // console.log(getIndexOfItem(results, "NO. SJ")[1]);

      // method 1
      // const [header, ...rows] = results.slice(headerIndex);
      // for (let vals = 0; vals < rows.length; vals++) {
      //   let row = rows[vals]
      //   let tableObj = {};
      //   for (let key = 0; key < header.length; key++) {
      //     tableObj[header[key]] = row[key]
      //   }
      //   contentTable.push(tableObj);
      // }

      // method 2
      contentTable = results.slice(headerIndex + 1).reduce((agg, arr) => {
        agg.push(arr.reduce((obj, item, index) => {
          obj[headerTable[index]] = item;
          return obj;
        }, {}));
        return agg;
      }, []);

      return { headerTable, contentTable };
    }
    else if (sheet === "route code") {
      let results = response.data.values, 
          headerTable = results.slice(0).shift(), 
          // routeCode = [];
          routeCode = results.slice(1).map(column => column[1]);

      console.log("results is = ", results);
      console.log("headerTable is = ", headerTable);
      console.log("routeCode is = ", routeCode);

      return { routeCode };
    }
    else {
      let results = response.data.values;
      let data = results.map(column => column[0]);
      // console.log("results nama pengirim is = ", results.map(column => column[0]));
      
      console.log("results is = ", results);
      console.log("data is = ", data);
      // return { listNamaPengirim };
      return data;
    }
    
  }).catch((error) => {
    return console.log('The API returned an error: ' + error);
  });
}

async function writeGoogleSheet(sheetName, cellRange, sheetResource) {
  let jwtClient = new google.auth.JWT(
         client_email,
         null,
         private_key,
         ['https://www.googleapis.com/auth/spreadsheets']);
  //authenticate request
  jwtClient.authorize((err, tokens) => {
   if (err) {
     console.log(err);
     return;
   } else {
     console.log("Successfully connected!");
   }
  });

  //Google Sheets API
  let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
      // sheetRange = 'DATABASE 2024!A1:AQ',
      sheetRange = `${sheetName}!${cellRange}`,
      sheets = google.sheets('v4');
  return await sheets.spreadsheets.values.update({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
    range: sheetRange,
    resource: sheetResource
  }).then((response) => {
    let results = response.data.values, 
        headerIndex = getIndexOfItem(results, "NO. JOJ")[0], 
        headerTable = results.slice(headerIndex).shift(), 
        contentTable = [];

    // method 1
    // const [header, ...rows] = results.slice(headerIndex);
    // for (let vals = 0; vals < rows.length; vals++) {
    //   let row = rows[vals]
    //   let tableObj = {};
    //   for (let key = 0; key < header.length; key++) {
    //     tableObj[header[key]] = row[key]
    //   }
    //   contentTable.push(tableObj);
    // }

    // method 2
    contentTable = results.slice(headerIndex + 1).reduce((agg, arr) => {
      agg.push(arr.reduce((obj, item, index) => {
        obj[headerTable[index]] = item;
        return obj;
      }, {}));
      return agg;
    }, []);

    return { headerTable, contentTable };
  }).catch((error) => {
    return console.log('The API returned an error: ' + error);
  });
}

// function getValues(spreadsheetId, range, callback) {
//   try {
//     gapi.client.sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetId,
//       range: range,
//     }).then((response) => {
//       const result = response.result;
//       const numRows = result.values ? result.values.length : 0;
//       console.log(`${numRows} rows retrieved.`);
//       if (callback) callback(response);
//     });
//   } catch (err) {
//     document.getElementById('content').innerText = err.message;
//     return;
//   }
// }

function getIndexOfItem(arr, item) {
  for (let i = 0; i < arr.length; i++) {
    let index = arr[i].indexOf(item);
    if (index > -1) {
      return [i, index];
    }
  }
}

function getRowColIndex(twoDArr, value) {
  // console.log("twoDArr = ",twoDArr);
  let colIndex = -1;
  const rowIndex = twoDArr.findIndex((row) => {
    const foundColIndex = row.indexOf(value);
    if (foundColIndex !== -1) {
      colIndex = foundColIndex;
      return true;
    }
  });
  return [rowIndex, colIndex];
}

// app.use("/", require("./routes/index"));
// app.use("/marketing", require("./routes/marketing"));

// mongoose.connect("mongodb://localhost:27017/united-transindo");
// mongoose.connect("mongodb://localhost:27017/united-transindo").then(() => console.log('mongodb Connected!'));

const databaseSchema = new mongoose.Schema({
  // field: String
}, {
  collection: "database"
});

const databaseModel = mongoose.model("database", databaseSchema);

const namaPengirimSchema = new mongoose.Schema({
  field: String
}, {
  collection: "nama-pengirim"
});

const namaPengirimModel = mongoose.model("nama-pengirim", namaPengirimSchema);

// console.log("namaPengirimSchema is = ", namaPengirimSchema);

// console.log("namaPengirimModel is = ", namaPengirimModel);

const alamatPengirimSchema = new mongoose.Schema({
  field: String
}, {
  collection: "alamat-pengirim"
});

const alamatPengirimModel = mongoose.model("alamat-pengirim", alamatPengirimSchema);

const kontakPengirimSchema = new mongoose.Schema({
  field: String
}, {
  collection: "kontak-pengirim"
});

const kontakPengirimModel = mongoose.model("kontak-pengirim", kontakPengirimSchema);

const namaPenerimaSchema = new mongoose.Schema({
  field: String
}, {
  collection: "nama-penerima"
});

const namaPenerimaModel = mongoose.model("nama-penerima", namaPenerimaSchema);

const alamatPenerimaSchema = new mongoose.Schema({
  field: String
}, {
  collection: "alamat-penerima"
});

const alamatPenerimaModel = mongoose.model("alamat-penerima", alamatPenerimaSchema);

const kontakPenerimaSchema = new mongoose.Schema({
  field: String
}, {
  collection: "kontak-penerima"
});

const kontakPenerimaModel = mongoose.model("kontak-penerima", kontakPenerimaSchema);

const merkUnitSchema = new mongoose.Schema({
  field: String
}, {
  collection: "merk-unit"
});

const merkUnitModel = mongoose.model("merk-unit", merkUnitSchema);

const typeUnitSchema = new mongoose.Schema({
  field: String
}, {
  collection: "type-unit"
});

const typeUnitModel = mongoose.model("type-unit", typeUnitSchema);

const nopolNokaUnitSchema = new mongoose.Schema({
  field: String
}, {
  collection: "nopol-noka-unit"
});

const nopolNokaUnitModel = mongoose.model("nopol-noka-unit", nopolNokaUnitSchema);

const warnaUnitSchema = new mongoose.Schema({
  field: String
}, {
  collection: "warna-unit"
});

const warnaUnitModel = mongoose.model("warna-unit", warnaUnitSchema);

const jobOrderSchema = new mongoose.Schema({
  // field: String
}, {
  collection: "job-order"
});

const jobOrderModel = mongoose.model("job-order", jobOrderSchema);


app.get("/", async(req, res) => {
  res.render("index", {
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});
  
app.get("/database", async(req, res) => {
  let { headerTable, contentTable } = await readGoogleSheet("database");
  // let { headerTable, contentTable } = await model.getDatabase();

  // console.log("headerTable is = ", headerTable);
  // console.log("contentTable is = ", contentTable);

  res.render("database", {
    headerTable,
    contentTable,
    message:"",
    errorMessage:"",
    resultArr:[]
  });
  
  // return res.status(400).send(errorResult);
});

app.get("/report", async(req, res) => {
  let { headerTable, contentTable } = await readGoogleSheet("database");
  let { routeCode } = await readGoogleSheet("route code");
  let { listNamaPengirim } = await readGoogleSheet("nama pengirim");

  console.log("headerTable = ", headerTable);
  // console.log("contentTable = ", contentTable);
  console.log("routeCode = ", routeCode);
  console.log("listNamaPengirim = ", listNamaPengirim);
  
  res.render("report", {
    headerTable,
    contentTable,
    routeCode,
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});

app.post("/report", async(req, res) => {
  console.log("report posts")
  console.log("req body is = ", req.body);
  
  let jwtClient = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/spreadsheets']);
  
  // authenticate request
  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Successfully connected!");
    }
  });
  
  // Google Sheets API
  let spreadsheetId = '1h5_afIl-tH4faCNGnRO-JjE6_r_e2iCnDfb7lb6Ng-U',
      sheetRange = 'DATABASE 2024!A1:AQ',
      sheets = google.sheets('v4');

  let dataTable = await sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: sheetRange
  })
  .then((response) => {
    console.log("response of spreadsheets values get = ", response);
    return response.data.values
  }, (error) => {
    // console.error('error: ' + reason.result.error.message);
    return console.log('The API returned an error: ' + error);
  });

  // console.log("dataTable = ", dataTable);

  let sheetName, cellRange, sheetResource, putReq, results = [];

  if (Array.isArray(req.body.nopol_noka)) {
    for (let index = 0; index < req.body.nopol_noka.length; index++) {
      let [RowIndex, ColumnIndex] = getRowColIndex(dataTable, req.body.nopol_noka[index])
      console.log(`nopol_noka index ${index} is = `, req.body.nopol_noka[index]);
      console.log(`RowIndex index ${index} is = `, RowIndex);
      console.log(`ColumnIndex index ${index} is = `, ColumnIndex);

      sheetName = "DATABASE 2024";
      // cellRange = "";
      let values = [[
        req.body.tgl_keluar[index],
        req.body.nama_kr[index],
        req.body.no_armada[index],
        req.body.nama_driver[index],
        req.body.lokasi_berangkat[index],
        req.body.tgl_masuk[index],
      ]];

      sheetResource =  { values, };
      // sheetRange = 'DATABASE 2024!A1:AQ',
      if (req.body.action === "langsir") {
        cellRange = `K${(RowIndex + 1)}:P${(RowIndex + 1)}`;
      }

      // console.log("sheetResource = ", sheetResource);

      console.log("sheetName  cellRange = ",`${sheetName}!${cellRange}`);
        
      putReq = await sheets.spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!${cellRange}`,
        valueInputOption: "RAW",
        resource: sheetResource
      }).then((response) => {
        console.log("response of spreadsheets values update = ", response);
        console.log("value response of spreadsheets values update = ", response.config.data.values);
        results.push(response.config.data.values[0])
        // return response.config.data.values
        // return res.status(200).send(results);
      }, (error) => {
        return console.error('error: ' + error.message);
        // return console.log('The API returned an error: ' + error);
        // return res.status(error.).send("Successfully Update Data");
      });


      // console.log("putReq = ", putReq);
      // console.log("putReq status = ", putReq.status);

      // if (putReq.status >= 400) {
      //   res.status(400).send("Error in saving the values");
      // }

      // let RowIndex = prevContentTable.indexOf(req.body.no_joj[index]);
      // 10
      // let ColumnIndex = prevContentTable[RowIndex].indexOf(item);
      
      // prevContentTable.splice(RowIndex, 1);
    }

    return res.status(200).send(results);
  } else {
    let [RowIndex, ColumnIndex] = getRowColIndex(dataTable, req.body.nopol_noka)
    console.log(`nopol_noka index is = `, req.body.nopol_noka);
    console.log(`RowIndex index is = `, RowIndex);
    console.log(`ColumnIndex index is = `, ColumnIndex);

    sheetName = "DATABASE 2024";
    // cellRange = "";
    let values = [[
      req.body.tgl_keluar,
      req.body.nama_kr,
      req.body.no_armada,
      req.body.nama_driver,
      req.body.lokasi_berangkat,
      req.body.tgl_masuk,
    ]];

    sheetResource =  { values, };
    // sheetRange = 'DATABASE 2024!A1:AQ',
    if (req.body.action === "langsir") {
      cellRange = `K${(RowIndex + 1)}:P${(RowIndex + 1)}`;
    }

    // console.log("sheetResource = ", sheetResource);

    console.log("sheetName  cellRange = ",`${sheetName}!${cellRange}`);
      
    putReq = await sheets.spreadsheets.values.update({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!${cellRange}`,
      valueInputOption: "RAW",
      resource: sheetResource
    }).then((response) => {
      console.log("response of spreadsheets values update = ", response);
      console.log("value response of spreadsheets values update = ", response.config.data.values);
      results.push(response.config.data.values[0])
      return res.status(200).send(results);
      // return response.config.data.values
      // return res.status(200).send(results);
    }, (error) => {
      return console.error('The API returned an error: ' + error.message);
    });

  }
  
});

app.get("/jsignature", async(req, res) => {
  res.render("jsignature", {
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});

// app.get("/marketing/entry-form", async(req, res) => {
app.get("/entry-form", async(req, res) => {
  // res.render("entry-form", {
  // res.render("marketing/entry-form", {
  res.render("entry-form", {
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});

// app.get("/marketing/report", async(req, res) => {
app.get("/report", async(req, res) => {
  let { headerTable, contentTable } = await readGoogleSheet("database");
  // res.render("marketing/report", {
  res.render("report", {
    headerTable,
    contentTable,
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});

// app.post("/marketing/report", async(req, res) => {
app.post("/report", async(req, res) => {
  // console.log("marketing report page posts")
  console.log("report page posts")
});

// app.get("/marketing/job-order", async(req, res) => {
app.get("/job-order", async(req, res) => {
  let { contentTable } = await readGoogleSheet("database");
  // res.render("marketing/job-order", {
  res.render("job-order", {
    contentTable,
    message:"",
    errorMessage:"",
    resultArr:[]
  });
});

// app.get("/marketing/choose-jo-city", async(req, res) => {
// app.get("/marketing/input-job-order", async(req, res) => {
app.get("/input-job-order", async(req, res) => {
  // used
  // let { contentTable } = await readGoogleSheet("database");

  // unused
  // let listNamaPengirim = await readGoogleSheet("nama pengirim");
  // let listAlamatPengirim = await readGoogleSheet("alamat pengirim");
  // let listKontakPengirim = await readGoogleSheet("kontak pengirim");
  // let listNamaPenerima = await readGoogleSheet("nama penerima");
  // let listAlamatPenerima = await readGoogleSheet("alamat penerima");
  // let listKontakPenerima = await readGoogleSheet("kontak penerima");
  // let listMerkUnit = await readGoogleSheet("merk");
  // let listTypeUnit = await readGoogleSheet("type");
  // let listWarnaUnit = await readGoogleSheet("warna");
  // // let listNopolNokaUnit = await readGoogleSheet("nopol noka");

  let contentTable, list_no_joj;

  try {
    // Connect to the MongoDB client
    await client.connect();

    // Find operation after successful connection
    contentTable = await db.collection('database').find({}, {timeout: false}).toArray(function(err, result) {
      if (err) throw err;
      console.log("result of contentTable is = ", result);
      // db.close();
    });
  } catch (err) {
    console.error(err);
  } finally {
    // Ensure the client is closed when done
    await client.close();
  }

  console.log("contentTable is = ", contentTable);
  // console.log("list_no_joj is = ", list_no_joj);

  // let list_no_joj = contentTable.map((data) => data["NO. JOJ"]).map((value) => Number(value));
  list_no_joj = contentTable.map((data) => data["NO"][" JOJ"]).map((value) => Number(value));
  // console.log("list_no_joj is = ", list_no_joj);
  const findMax = value => value.reduce((res, cur) => res < cur ? cur : res, -Infinity);
  // console.log("max of no joj = ", findMax(list_no_joj));
  
  let getData = true;
  let listNamaPengirim = await namaPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listAlamatPengirim = await alamatPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listKontakPengirim = await kontakPengirimModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listNamaPenerima = await namaPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listAlamatPenerima = await alamatPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listKontakPenerima = await kontakPenerimaModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listMerkUnit = await merkUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  let listTypeUnit = await typeUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });
  // const listNopolNokaUnit = await nopolNokaUnitModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  let listWarnaUnit = await warnaUnitModel.find({}).select({"field": 1, "_id": 0})
    .catch(function(err) {
      getData = false;
      console.log(err);
    });

  listNamaPengirim = listNamaPengirim.map((data) => data.field);
  listAlamatPengirim = listAlamatPengirim.map((data) => data.field);
  listKontakPengirim = listKontakPengirim.map((data) => data.field);
  listNamaPenerima = listNamaPenerima.map((data) => data.field);
  listAlamatPenerima = listAlamatPenerima.map((data) => data.field);
  listKontakPenerima = listKontakPenerima.map((data) => data.field);
  listMerkUnit = listMerkUnit.map((data) => data.field);
  listTypeUnit = listTypeUnit.map((data) => data.field);
  listWarnaUnit = listWarnaUnit.map((data) => data.field);

  if (!getData) {
    return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  } else {
    res.render("input-job-order", {
    // res.render("marketing/input-job-order", {
      // contentTable,
      no_joj: findMax(list_no_joj),
      listNamaPengirim,
      listAlamatPengirim,
      listKontakPengirim,
      listNamaPenerima,
      listAlamatPenerima,
      listKontakPenerima,
      listMerkUnit,
      listTypeUnit,
      listWarnaUnit,
      // listNopolNokaUnit,
      message:"",
      errorMessage:"",
      resultArr:[]
    });
  }
});

// app.post("/marketing/input-job-order", async(req, res) => {
app.post("/input-job-order", async(req, res) => {
  console.log("req body of input-job-order = ", req.body);

  let {
    nama_pengirim,
    alamat_pengirim,
    kontak_pengirim,
    nama_penerima,
    alamat_penerima,
    kontak_penerima,
    hr_tgl_ambil,
    qty,
    merk,
    tipe,
    nopol_noka,
    warna,
    status,
    nominal,
    moda,
    invoice,
    transfer_by,
    opsi_tagihan_top,
    opsi_penawaran_kontrak,
    no_opsi_penawaran_kontrak,
    note
  } = req.body;
  // let dbo = mongoose.db


  try {
    // Connect to the MongoDB client
    await client.connect();

    // Insert operation after successful connection
    const result = await db.collection('job-order').insertOne(req.body);
    
    // Insert into collection
    console.log('Inserted documents =>', result);
  } catch (err) {
    console.error(err);
  } finally {
    // Ensure the client is closed when done
    await client.close();
  }



  // let getData = true;

  // let query = { field: obj.nama_pengirim };
  // let update = { 
  //   $setOnInsert: {
  //     field: obj.nama_pengirim,
  //   }
  // };
  // let options = { upsert: true };
  // await namaPengirimModel.findOneAndUpdate(query, update, options, (err, results) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log("namaPengirimModel findOneAndUpdate is = ", results);
  // });

  // await alamatPengirimModel

  // let listNamaPengirim = await namaPengirimModel.find({ field: obj.nama_pengirim }, function (err, results) {
  //   if (err) { 
  //     console.error(err);
  //   }
  //   if (!results.length) {
  //     console.log("");

  //   }
  // });
    // .catch(function(err) {
    //   getData = false;
    //   console.log(err);
    // });

    
});

// app.get("/marketing/nama-pengirim", async(req, res) => {
//   await readGoogleSheet("nama pengirim");

// });

// app.get("/generate-no-job-order", async(req, res) => {
//   let { contentTable } = await readGoogleSheet("database");
//   var list_no_joj = contentTable.map((data) => data["NO. JOJ"]).map((value) => Number(value));
//   const findMax = value => value.reduce((res, cur) => res < cur ? cur : res, -Infinity);
//   return res.status(200).send({ no_joj: findMax(list_no_joj), });
// });

app.get("/job-order-data", async(req, res) => {
  // let { contentTable } = await readGoogleSheet("database");
  // let { listNamaPengirim } = await readGoogleSheet("nama pengirim");
  let nama_pengirim = await readGoogleSheet("nama pengirim");
  let alamat_pengirim = await readGoogleSheet("alamat pengirim");
  let kontak_pengirim = await readGoogleSheet("kontak pengirim");
  let nama_penerima = await readGoogleSheet("nama penerima");
  let alamat_penerima = await readGoogleSheet("alamat penerima");
  let kontak_penerima = await readGoogleSheet("kontak penerima");
  let merk = await readGoogleSheet("merk");
  let type = await readGoogleSheet("type");
  let warna = await readGoogleSheet("warna");
  // console.log("contentTable = ", contentTable);
  // console.log("listNamaPengirim = ", nama_pengirim);
  let getData = true;

  return res.status(200).send({
    // contentTable,
    nama_pengirim,
    alamat_pengirim,
    kontak_pengirim,
    nama_penerima,
    alamat_penerima,
    kontak_penerima,
    merk,
    type,
    warna,
  });
  // const listNamaPengirim = await NamaPengirimModel.find({})
  //   .then(function(nama_pengirim) {
  //     res.json(nama_pengirim);
  //   }).catch(function(err) {
  //     console.log(err);
  //   });
  // console.log("listNamaPengirim = ", listNamaPengirim);
  // const listNamaPengirim = await namaPengirimModel.find({});


  // const listNamaPengirim = await namaPengirimModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listAlamatPengirim = await alamatPengirimModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listKontakPengirim = await kontakPengirimModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listNamaPenerima = await namaPenerimaModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listAlamatPenerima = await alamatPenerimaModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listKontakPenerima = await kontakPenerimaModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listMerkUnit = await merkUnitModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listTypeUnit = await typeUnitModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listNopolNokaUnit = await nopolNokaUnitModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // const listWarnaUnit = await warnaUnitModel.find({})
  //   .catch(function(err) {
  //     getData = false;
  //     console.log(err);
  //   });
  // if (getData) {
  //   return res.status(200).send({
  //     contentTable,
  //     listNamaPengirim,
  //     listAlamatPengirim,
  //     listKontakPengirim,
  //     listNamaPenerima,
  //     listAlamatPenerima,
  //     listKontakPenerima,
  //     listMerkUnit,
  //     listTypeUnit,
  //     listNopolNokaUnit,
  //     listWarnaUnit,
  //   });
  // } else {
  //   return res.status(500).send("Request Timeout - Internal Server Error \n There is problem when getting data");
  // }
  
  // res.render("marketing/input-job-order", {
  //   contentTable,
  //   listNamaPengirim,
  //   listAlamatPengirim,
  //   listKontakPengirim,
  //   listNamaPenerima,
  //   listAlamatPenerima,
  //   listKontakPenerima,
  //   listMerkUnit,
  //   listTypeUnit,
  //   listNopolNokaUnit,
  //   listWarnaUnit,
  //   message:"",
  //   errorMessage:"",
  //   resultArr:[]
  // });
});

// app.post("/marketing/report", async(req, res) => {
//   let { headerTable, contentTable } = await getDatabase();
//   // console.log("contentTable is = ", contentTable);

//   let input = req.body
//   res.render("marketing/report", {
//     headerTable,
//     contentTable,
//     message:"",
//     errorMessage:"",
//     resultArr:[]
//   });
// });

// app.get("/", (request, response) => {
//   readFile("./demo_1/index.html", "utf-8", (err, html) => {
//     if (err) {
//       response.status(500).send("Request Timeout - Internal Server Error");
//     }
//     response.send(html);
//   });
// });

// app.listen(process.env.PORT || 1337, (request, response) =>
// app.listen(5000, (request, response) => console.log("running on 5000"));
// app.listen(PORT, (err) => {
//   if (err) {
//     return console.log("ERROR", err);
//   }
//   console.log(`Running to port ${PORT}`);
// });

// mongoose
//   .connect("mongodb://localhost:27017/united-transindo")
//   .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT, (err) => {
//       if (err) {
//         return console.log("ERROR", err);
//       }
//       console.log(`Node API App is running on port ${PORT}`);
//     });
//   }).catch((error) => {
//     console.log(error)
//   });

// // let db = mongoose.connection;
// mongoose.connection.on("error", console.error.bind(console, "MongoDB Connection Error"));

// console.log(process.platform);
// console.log(process.env.TZ);
// console.log(process.env.PORT);
// console.log(myModule);
