var io = require('socket.io')(process.env.PORT||5000);
var shortid = require('shortid');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port = 3000;
var players = [];


console.log("Server Running");

app.engine('handlebars', exphbs({
    defaultLayout:'main'
}));
app.set('view engine', 'handlebars');
//var Entry = mongoose.model('Entries');

// functions to use body parser 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//route to index.html
router.get('/',function(req, res){
    //res.sendFile(path.join(__dirname+'/index.html'));
    //var title = "Welcome to the game app";
    res.render('index');
});


app.get('/', function(req,res){
    console.log("Request made from fetch");
    Entry.find({}).then(function(entries){
        res.render('index', {entries:entries})
    });
});

mongoose.connect("mongodb://localhost:27017/playerScores", {
    useMongoClient:true
}).then(function(){
    
}).catch(function(err){

})

require("./models/Entry");
var Entry = mongoose.model('Entries');

io.on('connection',function(socket){
    console.log("Connected to Unity");
    socket.emit('connected');

    var thisPlayerId = shortid.generate();
    var score = 0;

    var player = {
        id:thisPlayerId,
        score,
        position:{
            v:0,
            
        }
    }

    players[thisPlayerId] = player;
    socket.emit('register', {id:thisPlayerId});

    socket.broadcast.emit('spawn', {id:thisPlayerId});
    socket.broadcast.emit('requestPosition');
    
    

    for(var playerId in players){
        if(playerId == thisPlayerId)
        continue;
        socket.emit('spawn', players[playerId]);
        console.log('Sending spawn to new with ID', thisPlayerId);
    }
    socket.on('senddata', function(data){
        console.log(JSON.stringify(data))

        var newEntry = {
            playerID:thisPlayerId,
            Score:0
        }
    
        new Entry(newEntry).save().then(function(entry){
            res.redirect('/');
        });
    });

    socket.on('sayhello', function(data){
        console.log("Unity Game says hello");
        socket.emit('talkback');
    });

    socket.on('disconnect', function(){
        console.log("Player Disconnected");
        delete players[thisPlayerId];
        socket.broadcast.emit('disconnected', {id:thisPlayerId});
    } );

    socket.on('move', function(data){
        data.id = thisPlayerId;
        data.score = score++;
        console.log(data);
        Entry.findOne({
            playerID:thisPlayerId
        }).then(function(entry){
            

            
            entry.Score = data.score;

            entry.save().then(function(idea){
                socket.broadcast.emit('move', data);
            })
        
        })
       // console.log("Player Moved", JSON.stringify(data));
        
    });

    socket.on('updatePosition', function(data){
        data.id = thisPlayerId;
        socket.broadcast.emit('updatePosition', data);
    });

})

app.use(express.static(__dirname + '/views'));
//app.use(express.static(__dirname + '/scripts'))
app.use('/', router);


app.listen(port, function(){
    console.log("server is running on port: " + port);
});