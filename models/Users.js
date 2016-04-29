var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  net_id: {type: String, lowercase: true, unique: true, required: true},
  email: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  notifications: [{type: String, required:false}],
  posted: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}]
});

mongoose.model('User', UserSchema);