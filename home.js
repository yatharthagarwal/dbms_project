var express=require('express');
var ejs=require('ejs');
var path = require('path');
var mysql=require('mysql');
var popup=require('js-popup');
var bodyParser = require('body-parser');
var app=express();


app.set('view engine', 'ejs');
var publicDir = require('path').join(__dirname,'/image');
app.use(express.static(publicDir));
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
    con.query(q, data, (err,result) => {
        if (err) 
        throw err;

        else if(result.length >0)
        {
			if(result[0].Password == password)
            res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/dashboard.ejs'));
        }
        
       else
        {
           res.send(500,'Incorrect Information');
        }
    });
        console.log("checked");
        
});



app.post('/register1',urlencodedParser,function(req,res){

    var names=req.body.Name;
    var mobile=req.body.number;
    var username=req.body.email;
    var password=req.body.password;

    let q = "INSERT INTO userdetail VALUES(null, ?, ?, ?, ?,'');"
    let data = [names ,mobile, username, password]
    con.query(q, data, (err,result) => {
        if (err) throw err;

        console.log("Account created");
        res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/register.ejs'));
    });
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
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/profile.ejs'));
    
});

app.get('/wallet',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/wallet.ejs'));
    
});

app.get('/bank',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/link_bank.ejs'));
    
});

app.get('/pay',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/pay.ejs'));
    
});

app.get('/das',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/dashboard.ejs'));
    
});

app.listen(8000,function(){
    console.log('listening to server 8000 ');
 });

