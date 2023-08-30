const express = require('express');
const app = express();
const path = require('path');
const routes = require('./public/routes');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.static('/home/vikash05/Desktop/biovis/node_viovis/public/'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'exp.html'));
});
app.use('/', routes);

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});
