const { default: mongoose } = require("mongoose")

exports.dbconnect = () => {
    mongoose.connect('mongodb+srv://sahil123:sahil123@sahil.eumlk.mongodb.net/jwt ')
    .then(() => { console.log("db connected 👍") })
    .catch((err) => { console.log(err) })
}