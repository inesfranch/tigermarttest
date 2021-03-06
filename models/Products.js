var mongoose = require('mongoose');

//product model
var ProductSchema = new mongoose.Schema({
  title: {type: String, required: true},
  category: {type: String, required: true},
  description: String,
  price: {type: Number, min: 0, required: true},
  pictures: {type: String},
  date: {type: Date, default: Date.now, required: true},
  month: {type: String, required: true},
  day: {type: String, required: true},
  year: {type: String, required: true},
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: {type: Boolean, default: true, required: true}
});

mongoose.model('Product', ProductSchema);