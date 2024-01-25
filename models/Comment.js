const mongoose=require('mongoose');
const commentSchema= new mongoose.Schema({
    user_id:{
        type:String,
    },
    post_id:{
        type: String,
    },
    comment:{
        type:String,
    }
});

module.exports=mongoose.model('comments',commentSchema);