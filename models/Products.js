var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  title: {type: String, required: true},
  category: {type: String, required: true},
  description: String,
  price: {type: Number, min: 0, required: true},
  pictures: {type: String},
  tags: {type: String},
  date: {type: Date, default: Date.now, required: true},
  month: {type: String, required: true},
  day: {type: String, required: true},
  year: {type: String, required: true},
  //net_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  net_id: {type: String, default: 'mfishman', required: true}, // NEED TO CHANGE NET_ID DEFAULT!
  active: {type: Boolean, default: true, required: true}
});

mongoose.model('Product', ProductSchema);