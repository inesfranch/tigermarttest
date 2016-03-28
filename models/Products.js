var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: {type: Number, default: 0}
});

mongoose.model('Product', ProductSchema);