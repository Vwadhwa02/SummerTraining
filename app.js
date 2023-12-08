// backend code done by Kairav
// #Warning!! 
// Don't touch anything in this file and files under models folder
// even a single mistake could easily break the server 
// unless you know what you are doing, happy coding!!
// #TODO
// transactions
// edit delete records in dashboard_admin
// frontend re-devlopment


const express = require('express');
const app = express();
const port = process.env.port || 4000;

// clears console after running for readability || delete this for history
console.clear()

// import static path
app.use('/public', express.static('public'));

// using local modules
const mongoose = require('./db/conn');
const SignupModel = require('./models/signup');
const LoginModel = require('./models/login');
const CardModel = require('./models/card');

// use hbs system
app.set('view engine','hbs');

// for data conversion and readability
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// login session, manual
let login_id = false;
let login_ip_admin = [];

//------routing
app.get("/", (req,res)=>{
    res.render('signup');
})

app.get("/dashboard_admin", async (req,res)=>{
    if (login_ip_admin.includes(req.ip)){
        var carddetail = await CardModel.find({});
        var signupdetail = await SignupModel.find({});
        res.render('dashboard', {cardobj:carddetail, signobj:signupdetail});
    }else{
        res.redirect('login_admin');
    }

})

app.get("/dashboard", async (req,res)=>{
    // var signupdetail = await SignupModel.find({});
    if (login_id){
        var carddetail = await CardModel.findOne({uid:login_id});
        login_id = false;
        res.render('dashboard_user', {cardobj:carddetail});
    }else{
        res.redirect('login');
    }
    
})

app.get("/signup", (req,res)=>{
    res.render('signup');
})

app.get("/login_admin", (req,res)=>{
    res.render('login');
})

app.get("/login", (req,res)=>{
    res.render('login_user');
})


// transferring data, signup ==> database
app.post('/signup',async (req,res)=>{

    // checks for duplicate users
    var mail = req.body.email;
    const mailid = await SignupModel.findOne({email:mail});
    if(mailid != null){return res.render('signup',{errormsg:'Error, User already exists!!'});}

    // generate card details
    var uid = mail.split('@')[0];
    var cv = Math.floor(Math.random() * (999 - 100 + 1)) + 100;;
    var cardnum = Math.floor(Math.random() * (99999999999 - 10000000000 + 1)) + 10000000000;
    var time = new Date;
    var today = time.toLocaleDateString();
    var exp = Number(String(time.getMonth() + 1) + String(time.getFullYear()%100 + 4));

    // saves login detials to database
    const SignupView = new SignupModel({
        uid: uid,
        email: mail,
        pass: req.body.pass,
        name: req.body.name,
        mobile: req.body.mobile,
        date: today
    });
    SignupView.save();

    // save generated card details to database
    const CardView = new CardModel({
        uid: uid,
        cardnumber: cardnum,
        cvv: cv,
        exp: exp,
        bal: 2000
    });
    CardView.save();

    // display card details to user || one time
    res.status(200).end(
        "\nunique ID: " + uid +
        "\ncardnumber: " + cardnum +
        "\ncvv: " +  cv +
        "\nexp: " +  exp +
        "\n\n\n-------------------------------------" +
        "\nNote these details for future refference," +
        "\nThis page will not be shown again"
    );
});


// comparing admin login data
app.post('/login_admin',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userdetail = await LoginModel.findOne({name:username});
   if(userdetail){
    if(userdetail.pass==password){
        login_ip_admin.push(req.ip);
        res.redirect('dashboard_admin');
    }else{
        res.render('login',{errormsg:'Error, incorrect ID or Password'});
    }
   }else{
        res.render('login',{errormsg:'Error, incorrect ID or Password'});
   }
  });
  
// comparing user login data
app.post('/login',async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const userdetail = await SignupModel.findOne({uid:username});
   if(userdetail){
    if(userdetail.pass==password){
        login_id = username;
        res.redirect('dashboard');
    }else{
        res.render('login_user',{errormsg:'Error, incorrect ID or Password'});
    }
   }else{
        res.render('login_user',{errormsg:'Error, incorrect ID or Password'});
   }
  });

//-----------------------------------------------work in progress
// depreciated now, function already done, for future refference
// get card detail api

app.post('/api/v1/createuser',async (req,res)=>{
    const SignupView = new SignupModel({
        usrName:req.body.txtusername,
        usrEmail:req.body.txtemail
    });
    const result = await SignupView.save();
    console.log(result);
   res.redirect('/');
});
//-----------------------------------------------


// api to get user details
app.get('/api/v2/getusers',async (req,res)=>{
    var query = {name:1, email:1, pass:1, mobile:1, uid:1, date:1, _id:0};
    const user = await SignupModel.find({},query);
    res.status(200).end(JSON.stringify(user));
  })

// api to get card details
app.get('/api/v1/card',async (req,res)=>{
    var query = {cardnumber:1, cvv:1, exp:1, bal:1, uid:1, _id:0};
    const user = await CardModel.find({},query);
    res.status(200).end(JSON.stringify(user));
  })


// always end with this footer code below this line
// error status
app.get("*", (req,res)=>{
    res.status(400).end('server responded but resource not found');
})

// start listen service
app.listen(port, ()=>{
    console.log(`server port = ${port}`);
})
