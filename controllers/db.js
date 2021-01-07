
const mongoose = require('mongoose');

module.exports = function(app){

    app.get('/a', (request, respond) => {
        
    })

    app.get('/testDB', (request, respond) => {

        var url = app.locals.config.db.url

        //mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

        // const Cat = mongoose.model('Cat', { name: String });

        // const kitty = new Cat({ name: 'Zildjian' });
        // kitty.save().then(() => console.log('meow'));
        
        // respond.render('pages/testDB',  {
        //     message: message,
        //     collections: collections,
        //     collection: coll,
        //     rows: rows
        // })

        //return true;

        var MongoClient = require('mongodb').MongoClient;


        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            console.log("Database connected!");

            var message = '';
            var collections = '';
            var rows = '';
            var coll = 'customers';
            
            var dbo = db.db(app.locals.config.db.name);
            var rowInsert = { name: "Company Inc", address: "Highway 37" };

            if(!dbo.collection(coll)) {
                dbo.createCollection(coll, function(err, res) {
                    if (err) throw err;
                    console.log("Collection created!");
                    globalThis.message += "Collection created! <br/>";
                });
            }

            // dbo.collection(coll).insertOne(rowInsert, function(err, res) {
            //     if (err) throw err;
            //     console.log("1 document inserted");
            //     message += "1 document inserted: "+rowInsert+"<br />";
            // });

            dbo.collection(coll).findOne({}, function(err, result) {
                if (err) throw err;
                if(result) {
                    console.log(result.name);
                    message += "Row: "+result.name;
                }
            });

            dbo.listCollections().toArray(function(err, collInfos) {
                // console.log(JSON.stringify(collInfos));
                collections = JSON.stringify(collInfos);
            });

            dbo.collection(coll).find().toArray(function(err, docs) {
                // console.log(JSON.stringify(docs));
                rows = JSON.stringify(docs);
            });
            
            db.close();

            respond.render('pages/testDB',  {
                message: message,
                collections: collections,
                collection: coll,
                rows: rows
            })

        });

    })

}