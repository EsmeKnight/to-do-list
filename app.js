//jshint esversion:6

import express from 'express';
import bodyParser from 'body-parser'
import date from './date.js'

const app = express();
const currentDate = date.date;
const day = date.day;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const items = ['Buy Food', 'Cook Food', 'Eat Food'];
const workItems = [];

app.get('/', (req, res) => {


    res.render('list', { listTitle: currentDate, newListItems: items });
});

app.post('/', function (req, res) {
    let item = req.body.newItem;
    if (req.body.list === 'Work List') {
        workItems.push(item);
        res.redirect('/work');
    } else {
        items.push(item);
        res.redirect('/');
    }
});
app.get('/work', function (req, res) {
    res.render('list', { listTitle: 'Work List', newListItems: workItems });
    res.write("<button")
});

app.get('/about', function (req, res) {
    res.render("about");
});

const port = process.env.PORT || 3000;

app.listen(port, (req, res) => {
    console.log(`Your server is running on http://localhost:${port}`);
});