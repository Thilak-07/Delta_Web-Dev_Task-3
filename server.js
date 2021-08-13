const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
var mongo_url = 'mongodb+srv://Elliot:mongoDB02@elliotcluster.kjdcr.mongodb.net/Logindb?retryWrites=true&w=majority';

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'My_Secret_Key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        sameSite: false,
        maxAge: 1000*60*60*10
    }
}))

MongoClient.connect(mongo_url, (err, client) => {
    if (err) throw err;
    const db = client.db('Logindb');
    const users = db.collection('Client_Info');
    const teams = db.collection('Teams_Info');

    app.get('/', function(req,res){
        res.redirect("/Auth")
    })

    app.get('/Auth', function(req,res){
        res.render('auth.ejs');
    })

    app.post("/Auth", function(req,res){
        if (req.param('action') == 'signin') {
            //console.log(req.body);
            users.find({ username: req.body.username }).toArray(function (err, result) {
                if (err) throw err;
                if (result[0] == undefined) {
                    res.render('auth.ejs', { data1: "Incorrect username or password", msg_type1: "err_msg" })
                    console.log('Signin Fail.')
                }
                else if (result[0].password == req.body.password) {
                    req.session.user = req.body.username;
                    res.redirect('/Dashboard');
                    console.log('Signin Successful.')
                }
                else {
                    res.render('auth.ejs', { data1: "Incorrect username or password", msg_type1: "err_msg" })
                    console.log('Signin Fail.')
                }
            })
        }

        else {
            //console.log(req.body);
            users.find({ username: req.body.username }).toArray(function (err, result) {
                if (err) throw err;
                if (!result.length) {
                    if (req.body.password == req.body.r_password) {
                        users.insertOne(req.body);
                        res.render('auth.ejs', { data: "Signup Successful.", mode: "sign-up-mode", msg_type: "success_msg" })
                        console.log('Signup Successful.')
                    }
                    else {
                        res.render('auth.ejs', { data: "Password and repeat password do not match !", mode: "sign-up-mode", msg_type: "err_msg" })
                        console.log('Signup Fail.')
                    }
                }
                else {
                    res.render('auth.ejs', { data: "Username already exists !", mode: "sign-up-mode", msg_type: "err_msg" })
                    console.log('Signup Fail.')
                }
            })
        }
    })

    app.get('/Dashboard', function(req,res) {
        if (req.session.user){
            console.log('Session_user:', req.session.user)
            //console.log(req.sessionID)
            res.render('dashboard', {user_name: req.session.user.toUpperCase()});
        }
        else {
            res.redirect("/Auth") 
        }
    })

    app.get('/Teams', function(req,res) {
        users.find({ username: req.session.user }).toArray(function (err, result) {      
            if (err) throw err;
            if (result.length) {
                console.log("Your Teams:", result[0].teams)
                res.render('teams', {docs: result[0].teams});
            }
            else {
                res.redirect('/Auth')
            }
        }) 
    })

    app.get('/Polls', function(req,res) {
        users.find({ username: req.session.user }).toArray(function (err, result) {      
            if (err) throw err;
            if (result.length) {
                res.render('polls', {docs: result[0].teams});
            }
            else {
                res.redirect('/Auth')
            }
        })
    })

    app.get('/Logout', function(req,res) {
        req.session.destroy(function(err) {
            if (err) throw err;
        })
        res.redirect("/Auth")
    })

    app.get('/Teams/CreateTeam', function(req,res) {
        res.render('create_team');
    })

    app.post('/Teams/CreateTeam', function(req,res) {
        teams.find({ teamname: req.body.teamname }).toArray(function (err, result) {
            if (err) throw err;
            if (!result.length) {
                teams.insertOne({teamname: req.body.teamname, members:[req.session.user]});
                users.updateOne({username: req.session.user }, { $push:{ teams: req.body.teamname } })
                res.render('create_team', {status:'success_msg', alert:'Team created successfully.'});
            }
            else {
                res.render('create_team', {status:'err_msg', alert:'Team already exists !'});
            }
        })
    })

    app.get('/Teams/JoinTeam', function(req,res) {
        res.render('join_team');
    })

    app.post('/Teams/JoinTeam', function(req,res) {
        teams.find({ teamname: req.body.teamname }).toArray(function (err, result) {
            if (err) throw err;
            if (!result.length) {
                res.render('join_team', {status:'err_msg', alert:"Invalid teamname !"});
            }
            else if(result[0].members.indexOf(req.session.user) !== -1){
                res.render('join_team', {status:'err_msg', alert:"You're already in that Team !"});
            }
            else {
                teams.updateOne({ teamname: req.body.teamname }, { $push:{ members:req.session.user } })
                users.updateOne({username: req.session.user }, { $push:{ teams: req.body.teamname } })
                res.render('join_team', {status:'success_msg', alert:"You're added to the team."}); 
            }
        })
    })
    
    app.get('/Polls/CreatePoll', function(req,res) {
        res.send("Sorry!. Creating polls under construction :)")
    })

    app.get('/Teams/:x', function(req,res){
        res.render('the_team')
    })

    app.listen(process.env.PORT || 3000, () => {
        console.log('Listening on port 3000');
    })
});




