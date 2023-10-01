const mongoose=require('mongoose')
const cities=require('./cities')
const Campground=require('../models/campground')
const {places,descriptors}=require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log("MONGO CONNECTION OPEN!!")
})

// const sample = array => array[Math.floor(Math.random() * array.length)]

const sample = (array) => {
    return array[Math.floor(Math.random()*array.length)]
}

const seedDB = async (req, res) => {
    await Campground.deleteMany({})
    // const c=new Campground({title: 'New Camping site'})
    // await c.save()

    for(let i=0; i<300; i++){
        const rand1000=Math.floor(Math.random()*1000)
        const randprice=Math.floor(Math.random()*20)+10
        const c=new Campground({
            author:'65071f3cbf926744726118b1',
            location:`${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ],
            price: randprice,
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo mollitia qui omnis repellendus dolorem, delectus consectetur dicta corrupti veniam nihil aliquid labore laboriosam doloremque aliquam. Possimus officiis sunt ut soluta!'
        })
        await c.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});
