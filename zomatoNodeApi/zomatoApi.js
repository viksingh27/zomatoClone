const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
// const dotEnv = require('dotenv');
const mongo  = require('mongodb');
const { query } = require('express');
const mongoCliet = mongo.MongoClient;
// dotEnv.config();
const mongoUrl = MongoLiveUrl = 'mongodb+srv://testDevUser:testDevUser@cluster0.bpimv.mongodb.net/edu_intern?retryWrites=true&w=majority';
var port = process.env.PORT || 8225;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors())
var db;

app.get('/api' , (req,res)=>{
    res.send("Hello from server");
})

//return all the city

app.get('/api/v1/location' , (req,res)=>{
    db.collection('locations').find().toArray((err,result)=>{
        if(err) {
            throw err; //

        }
        res.send(result);
    })
})


//return all the meal_type

app.get('/api/v1/meals' , (req,res)=>{
    db.collection('meal_types').find().toArray((err,result)=>{
        if(err) {
            throw err;
        }
        res.send(result);
    })
})


//return restaurant wrt id

app.get('/api/v1/restaurants/:id', (req,res)=>{
    const id = Number(req.params.id);
    db.collection('restaurant_data').find({"restaurant_id":id}).toArray((err,result)=>{

        if(err) {
            throw err;
        }
        res.send(result);
    })
})

//return restaurant wrt to cityName


app.get('/api/v1/restaurant' , (req,res)=>{
    let query = {};
    if(req.query.city){
        query = {state_id:Number(req.query.city)}
    }
    db.collection('restaurant_data').find(query).toArray((err,result)=>{
        if(err) {
            throw err;
        }
        res.status(200).send(result);
    })
})


//return data for filters

app.get('/api/v1/meals/filter/:mealId' , (req, res)=>{
    let id = Number(req.params.mealId)
    let query = {"mealTypes.mealtype_id":id}
    var sort = {cost:1}
    var skip = 0;
    var limit = 1000000000000
    if(req.query.sortKey){
        var sortKey = req.query.sortKey
        if(sortKey>1 || sortKey<-1 || sortKey==0){
            sortKey=1
        }
        sort = {cost: Number(sortKey)}
    }
    if(req.query.skip && req.query.limit){
        skip = Number(req.query.skip)
        limit = Number(req.query.limit)
    }

    if(req.query.lcost && req.query.hcost){
        var lcost = Number(req.query.lcost);
        var hcost = Number(req.query.hcost);
    }
    if(req.query.cuisine && req.query.lcost && req.query.hcost) {

        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],
        "cuisines.cuisine_id":Number(req.query.cuisine),
        "mealTypes.mealtype_id":id}
    }
    else if(req.query.cuisine)
    {
        query={"mealTypes.mealtype_id":id , "cuisines.cuisine_id":Number(req.query.cuisine)}
    }
    else if(req.query.lcost && req.query.hcost)
    {
        let lcost = Number(req.query.lcost)
        let hcost = Number(req.query.hcost)
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":id};
    }

    db.collection('restaurant_data').find(query).sort(sort).toArray((err,result)=>{
        if(err)
        throw err;
        res.send(result);
    })
})

//return menu data wrt to restaurantId

app.get('/api/v1/menu/:restId' , (req, res)=>{
    var restId = Number(req.params.restId);

    db.collection('restaurant_menu').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err)
        throw err;
        res.send(result);
    })
})


app.post('/api/v1/menuItem',(req,res) => {
    console.log(req.body);
    db.collection('restaurant_menu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
    
})

app.put('/updateStatus/:id',(req,res) => {
    var id = Number(req.params.id);
    var status = req.body.status?req.body.status:"Pending"
        db.collection('orders').updateOne(
            {id:id},
            {
                $set:{
                    "date":req.body.date,
                    "bank_status":req.body.bank_status,
                    "bank":req.body.bank,
                    "status":status
                }
            }
        )
        res.send('data updated')
})


//return all the orders 
app.get('/api/v1/orders',(req,res) => {
    db.collection('orders').find().toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

app.post('/api/v1/placeOrders',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed")
    })
})

app.delete('/api/v1/deletOrders',(req,res)=>{
    db.collection('orders').remove({},(err,result) => {
        if(err) throw err;
        res.send(result)
    })
})


mongoCliet.connect(mongoUrl , (err,client)=>{
    if(err){ 
        console.log("Error while connecting")
    }
    db = client.db('edu_intern');
    app.listen(port,()=>{
        console.log(`Connection Successful to database and listening on port ${port}`);
    });
})
