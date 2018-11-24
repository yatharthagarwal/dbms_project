var express=require('express');
var ejs=require('ejs');
var path = require('path');
var mysql=require('mysql');
var validator = require('validator');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app=express();
var x;
var p;

app.set('view engine', 'ejs');
var publicDir = require('path').join(__dirname,'/image');
app.use(express.static(publicDir));
app.use(cookieParser());
// app.use(session({
//     secret: 'abcd',
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: true }
//   }));

app.use(session({secret: 'ssshhhhh'}));

app.use(bodyParser.urlencoded({extended: true}));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var con=mysql.createConnection({
	host:'localhost',
	user:'root',
	//port:'3306',
	password:'root',
	database:'user'
});
con.connect(function(error){
    if (error) throw error;
   console.log("Connected!");
});

app.get('/',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/home1.ejs'));
    console.log("hi");
});

app.get('/login',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/login.ejs'));
});

app.get('/forgot',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/forgot_pass.ejs'));
});

app.get('/home',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/home1.ejs'));
   
});


app.get('/register',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/register.ejs'));
    
});

app.post('/login1',urlencodedParser,function(req,res){

    var email=req.body.email;
    var password=req.body.password;
    let q = "SELECT * FROM userdetail WHERE Username = ? and Password=?";
    let data = [email,password]
    let flag = 0
    con.query(q, data, (err,result) => {
        if (err) 
        throw err;

        else if(result.length >0)
        {
            if(result[0].Password == password)
            {
                //p=result[0].User_Id;
                req.session.user=result[0].User_Id;
                x=req.session.user;
                flag = 1
                console.log("this is session1 => " + req.session.user)
                //console.log(req.cookies);
               // console.log('******************');
                //console.log(req.session);
                //res.render('profile',{ "user" : x});
            }
        }
    });

    setTimeout(() => {
        if(flag){
            console.log("checked");
            console.log("this is session2 => " + req.session.user)
            res.render('dashboard');
        }
        else{
            res.send(500,'Incorrect Information');
        }
    }, 100)
        
});

app.get('/out',function(req,res){
    req.session.destroy(function(err) {
        if(err) throw err;
        res.render('home1');
      })
});

app.post('/register1',urlencodedParser,function(req,res){

    var names=req.body.Name;
    var mobile=req.body.number;
    var username=req.body.email;
    var password=req.body.password;
    if((mobile>0)&&(mobile.length==10))
    {
       let p = "INSERT INTO userdetail VALUES(null, ?, ?, ?, ?,'');"
       let data = [names ,mobile, username, password]
         con.query(p, data, (err,result) => {
        if (err) throw err;
        let q="SELECT User_Id from userdetail where Username=?";
        let data1 = [username];
        con.query(q,data1,(error,results) => {
            if(error) throw error;
        let r ="INSERT INTO Wallet VALUES(?,0);"
        let data2 = [results[0].User_Id]
           con.query(r,data2,(error,results) => {
            if(error) throw error;
         });
        });
        console.log("Account created");
        res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/register.ejs'));
      });
   }
   else
   {
        res.send(500,'incorrect data');
   }
});
   
app.post('/givepassword',urlencodedParser,function(req,res){
   var mob=req.body.number;
   var email=req.body.email;
   let q="SELECT Password from userdetail where Username=? and mobile=?";
   let data=[email,mob];
   con.query(q,data,(err,result) =>{
     if(err) throw err;
     else
     {
        res.json(result[0].Password); 
         res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/forgot_pass.ejs'));
     }
   });
});

app.get('/profile',function(req,res){
       // let h=x;
       //var html=new ejs({url: 'profile.ejs'}).render(x); 
       //document.getElementById("container").innerHTML=html;
       console.log("this is session1 => " + req.session.user)
       let qs = "SELECT * FROM userdetail WHERE User_Id=" + req.session.user
       let row = []  
       con.query(qs, (err, result) => {
            if(err) console.error(err)

            row = result
        })

       setTimeout(() => {
           if(row.length > 0){
            res.render('profile',{ "user" : row[0]});
           }
           else{
               res.redirect('/')
           }

       }, 100)
    
});

app.get('/wallet',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/wallet.ejs'));
    
});

app.get('/bank',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/link_bank.ejs'));
    
});

app.get('/pay',function(req,res){
    let user = req.session.user
    let q="SELECT Amount_in_wallet FROM Wallet WHERE Wallet_id=" + user;
    let row = []
    con.query(q,(err,result) =>{
        if(err) throw err;
        row = result
    });

    setTimeout(() => {
        if(row.length > 0){
            res.render('pay',{ "balance" : row[0]})
        }
        else{
            res.render('dashboard')
        }
    }, 100);    
    
});

app.post('/payment',function(req,res){
    var t;
 let user=req.session.user;
 var mob=req.body.number;
 var money=req.body.money;
 let q="select * from userdetail where mobile=?";
 let data=[mob];
 con.query(q,data,(error,result)=>{
    if(error) throw error;
     t=result[0].User_Id;
});
    con.beginTransaction(function(err) {
    if (err) { throw err; }
    con.query("UPDATE Wallet SET Amount_in_wallet=Amount_in_wallet+"+money+" WHERE Wallet_id="+t+";", function (error, results, fields) {
      if (error) {
        return con.rollback(function() {
          throw error;
        });
      }
      //else
      //res.render('pay',{balance : results[0]});
        con.query("UPDATE Wallet SET Amount_in_wallet=Amount_in_wallet-"+money+" WHERE Wallet_id="+user +";", function (error, results1, fields) {
        if (error) {
          return con.rollback(function() {
            throw error;
          });
        }
        con.commit(function(err) {
          if (err) {
            return con.rollback(function() {
              throw err;
            });
          }
          console.log('success!');
        });
        res.render('pay',{balance : results1[0]});
    });
    });
  });

   res.render('dashboard');
});

app.get('/das',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/dashboard.ejs'));
    
});

app.get('/addit',function(req,res){
     
});

app.listen(8000,function(){
    console.log('listening to server 8000 ');
 });
