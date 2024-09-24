const mongoose= require('mongoose')
const user = require('./user')

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    Date:{
        type:Date,
        default: Date.now()
    },
    content:String,
    likes:[
        {type:mongoose.Schema.Types.ObjectId, ref:'user'}
    ]
    
})

module.exports = mongoose.model('post' , postSchema)