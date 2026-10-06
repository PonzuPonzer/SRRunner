const express = require('express');
const app = express();
const fs = require('fs')
const open = (...args) => import('open').then(m => m.default(...args));
app.use(express.json());
app.use(express.static(__dirname));

const version = "0.1";
const port = 8080;

var accountPresent = false;
var account = null;
var catalog = null;
var level0 = null;
var level1 = null;
var level2 = null;

var newsDisplayed = false;

const coinMultiplier = 16;
const saveEnable = true;
const autoOpen = true;

console.log("Initializing SRRunner " + version + "...");

console.log("🔎 Looking for item catalog data...");
try {
  catalog = JSON.parse(fs.readFileSync('./catalog.json', { encoding: 'utf8', flag: 'r' }));
  console.log("🟢 Item catalog data found found!");
} catch (err) {
  console.log("🔴 No item catalog data found, terminating...");
  process.exit(1); 
}

console.log("🔎 Looking for account data...");
try {
  account = JSON.parse(fs.readFileSync('./account.json', { encoding: 'utf8', flag: 'r' }));
  console.log("🟢 Account data " +
    JSON.stringify(account.account.nickname).replace(/['"]+/g, '') + " - Level " +
    JSON.stringify(account.account.stats.level) + " (" + (account.account.stats.prestige) +
    ") found!");
  accountPresent = true;
} catch (err) {
  console.log("🔴 No account data present or data corrupted!");
}

app.post('/api/account/create', (req, res) => {
  account = JSON.parse(fs.readFileSync("./create.json", 'utf8'));
  account.account.nickname = req.body.nickname;
  account.account.stats.skin = req.body.color;
  res.json(account);
  delete account.success;
  accountPresent = true;
});

app.get('/api/account', (req, res) => {
  res.status(200);
  if (accountPresent) {
    return res.json(account);
  }
  else {
    return res.end(JSON.stringify({
      "account": null
    }));
  }
});

app.post('/api/account/stats', (req, res) => {
  res.status(200);
  req.body.stats.progress_stats
  account.account.stats = req.body.stats;
  return res.json(account.account.stats);
});

app.post('/api/account/coins', (req, res) => {


  if (parseInt(req.body.delta) > 0) {
    console.log("⬆️🪙 Adding " + String(parseInt(req.body.delta) * coinMultiplier) + " coins for " + String(req.body.reason));
    account.account.coins = parseInt(account.account.coins) + parseInt(req.body.delta) * coinMultiplier;
  }
  else {
    console.log("⬇️🪙 Removing " + String(req.body.delta) + " coins for " + String(req.body.reason));
    account.account.coins = parseInt(account.account.coins) + parseInt(req.body.delta) * coinMultiplier;
  }
  res.status(200);
  return res.end(JSON.stringify({
    "success": true,
    "coins": account.account.coins
  }));
});

app.get('/api/friends/requests', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "requests": [],
  }));
});

app.get('/api/shop/catalog', (req, res) => {
  res.status(200);
  return res.json(catalog);
});

app.get('/api/itemcats', (req, res) => {
  res.status(200);
  res.json(JSON.parse(fs.readFileSync("./itemcats.json", 'utf8')));
});

app.post('/api/sp/2ndchance/collect', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "success": true,
    "granted": 1,
    "chips": 99
  }));
});

app.post('/api/sp/2ndchance/use', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "success": true
  }));
});

app.get('/api/news', (req, res) => {
  //if (account.account.lastlogin != version) {
  if (newsDisplayed == false) {
    newsDisplayed = true;
    return res.end(JSON.stringify({
      "success": true, "index": 0, "news": ["SRRunner " + version + "\nBy Ponzu\nponzuponzer.carrd.co"]
    }))
  }
  else {
    return res.end(JSON.stringify({
      "success":true,
      "index":0,
      "news":[]
    }));
  }
});

app.get('/api/nickname', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "available": true
  }));
});

app.post('/api/sp', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "success": true
  }));
});

app.post('/api/shop/buy', (req, res) => {
  var price = Object.values(catalog.normal).find(item => item.n === req.body.item).price;
  console.log("⬇️🪙 Removing " + String(price) + " coins for " + String(req.body.item));
  account.account.coins = parseInt(account.account.coins) - parseInt(price);
  account.account.items.push(req.body.item);
  res.status(200);
  return res.end(JSON.stringify({
    "success": true,
    "account": account.account
  }));
});



//🔵insert sc coin code here

app.get('/api/levels/saves', (req, res) => {
  res.status(200);
  return res.end(JSON.stringify({
    "success": true
  }));
});

app.post('/api/levels/saves', (req, res) => {
  res.status(200);



  fs.writeFile('save0.json', JSON.stringify(req.body), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('📝 Account data saved successfully!');
    callback();
  });

  return res.end(JSON.stringify({
    "success": true
  }));
});














app.use((req, res, next) => {
  console.log("🟡 Unsupported API request \u001b[1;33m" + String(req.path) + "\u001b[0m!");
  res.status(501).json({
    success: false
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

if (autoOpen) {
  console.log("Opening game in browser...");
  open('http://localhost:8080/');
}

app.listen(port, () => {
  console.log("SRRunner " + version + " running on port " + String(port) + "!");
});



function exitHandler(callback) {
  fs.writeFile('account.json', JSON.stringify(account), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('📝 Account data saved successfully!');
    callback();
  });

}



process.on('SIGINT', () => {
  console.log("❗ Server shutting down...")
  exitHandler(() => process.exit(-1));
});