const express = require('express');
 const router = express.Router();
 const Item = require('../models/Item');
 router.get('/', async (req, res) => {
 const items = await Item.find();
 res.json(items);
 });
 router.post('/', async (req, res) => {
 const newItem = new Item(req.body);
 const savedItem = await newItem.save();
 res.json(savedItem);
 });
 module.exports = router;