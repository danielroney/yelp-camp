const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '5fef573112943d001781afb4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lucas ipsum dolor sit amet hutta kashyyyk brak gonk nelvaanian metalorn mimbanite solo mirax askajian. Klivian thrackan dengar utapau maul lando luke lando kenobi. Fisto hutt var moff. Amidala ybith solo sebulba chiss jagged. Raioballo rune vodran barabel cathar sikan dantari ssi-ruuk bothan. Maris shmi moff tatooine vratix vurk carnor maximilian. Ponda cabasshite nadon rugor var mirta balosar. Hapan vratix rugor aruzan. Baba daala sabé lumiya spar ubb leia moor. Ors kowakian metalorn annoo bando cliegg sidious tiin.',
            price: 30,
            images: [
                {
                    url: 'https://res.cloudinary.com/dfayxqdtd/image/upload/v1608266671/YelpCamp/evjyiitfyvuiujnxyiro.jpg',
                    filename: 'YelpCamp/evjyiitfyvuiujnxyiro'
                  }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})