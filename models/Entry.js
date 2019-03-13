var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EntrySchema = new Schema({
    playerID:{
        type:String,
        required:true
    },
    Score:{
        type:Number,
        required:true
    }
});

mongoose.model('Entries', EntrySchema);