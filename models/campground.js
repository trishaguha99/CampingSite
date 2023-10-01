const mongoose=require('mongoose');
const review = require('./review');
const Schema=mongoose.Schema;
const opts={toJSON : {virtuals : true}};

const ImageSchema=new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_300')
})

const CampgroundSchema=new Schema({
    title: String,
    price: Number,
    images:[ImageSchema],
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    description: String,
    location:String,
    reviews: [
        {
        type:Schema.Types.ObjectId,
        ref:'Review'
        }
    ],
    author: [
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popMarkup').get(function(){
    return `<Strong><a href="/campgrounds/${this._id}">${this.title}</a></Strong>
    <p>${this.description.substring(0,20)}...</p>`
})

CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc)
    {
        await review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Campground',CampgroundSchema)

