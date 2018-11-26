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
var bank;
var amount;

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

app.use(session({secret: 'abcd'}));

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

app.get('/out1',function(req,res){
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
    var password1=req.body.password1;
  
    console.log(bank);
    if(((mobile>0)&&(mobile.length==10))&&(password==password1))
    {
       let p = "INSERT INTO userdetail VALUES(null, ?, ?, ?, ?, ?, ?);"
       let data = [names ,mobile, username, password,bank,amount];
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
  
app.post('/register2',urlencodedParser,function(req,res){

    var names=req.body.Name;
   // var mobile=req.body.number;
    var username=req.body.email;
    var password=req.body.password;
    var password1=req.body.password1;
    if(password==password1)
    {
       let p = "INSERT INTO Admin VALUES(null, ?, ?, ?)";
       let data = [names, username, password]
         con.query(p, data, (err,result) => {
        if (err) throw err;
        console.log("Account created");
        res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/add_admin.ejs'));
      });
    }
    else
    {
        res.send("Password sholud be same in both the fields");
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
         console.log(result[0].Password);
        res.json(result[0].Password); 
         //res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/forgot_pass.ejs'));
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
    let user = req.session.user
    let k="SELECT * FROM Wallet WHERE Wallet_id=" + user;
    let balance;
    con.query(k,(err,result) =>{
        if(err) throw err;
        balance = result[0].Amount_in_wallet;
        // next();
    })
    //next();
    let q="SELECT * FROM payment_history WHERE Wallet_id_from=" + user;
    let sentRow = []
    let sentLength
    setTimeout(()=>{
        con.query(q,(err,result) =>{
            if(err) throw err;
            sentRow = result;
            sentLength = result.length
            // next();
        })
    },50);

    let c="SELECT * FROM payment_history WHERE wallet_id_to=" + user;
    let receiveRow = []
    let receiveLength;
    setTimeout(()=>{
        con.query(c,(err,result)=>{
            if(err) throw err;
            receiveRow=result;
            receiveLength = result.length
        })
    },100);

    setTimeout(() => {
        console.log("balance", balance, "sent Row", sentRow, "receive row", receiveRow)
        if((balance >= 0) && (sentLength >= 0) || (receiveLength >= 0)){
            res.render('wallet',{ "balance" : balance, "sentRow" : sentRow, "receiveRow" : receiveRow, "sentLength" : sentLength, "receiveLength" : receiveLength });
        }
        else{
            res.render('dashboard');
        }
    }, 150);   
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
    //var z;
 let user=req.session.user;
 var mob=req.body.number;
 var money=req.body.money;
 let q="select * from userdetail where mobile=?";
 let data=[mob];
 let row1=[]
 con.query(q,data,(error1,result)=>{
     if(error1) throw error1;
    row1=result[0];   
});
let ab="SELECT * from userdetail where User_Id=" + user;
let row= []
  con.query(ab,(error,results1)=>{
     if(error) throw error;
     row=results1[0];
     //z=results1[0].mobile;
  });
    con.beginTransaction(function(err) {
    if (err) { throw err; }
    con.query("UPDATE Wallet SET Amount_in_wallet=Amount_in_wallet+"+money+" WHERE Wallet_id="+row1.User_Id+";", function (error, results, fields) {
      if (error) {
        return con.rollback(function() {
          throw error;
        });
      }
        con.query("UPDATE Wallet SET Amount_in_wallet=Amount_in_wallet-"+money+" WHERE Wallet_id="+user +";", function (error, results1, fields) {
        if (error) {
          return con.rollback(function() {
            throw error;
          });
        }
        con.query("INSERT INTO payment_history VALUES(null,?,?,?,?,?,?,?);",[user,row1.User_Id,row.Name,row1.Name,row.mobile,mob,money], function (error, results1, fields) {
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
  });

   res.render('dashboard');
});


app.get('/das',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/dashboard.ejs'));
    
});

/*app.get('/addit',function(req,res){
     
});*/

app.get('/remove',function(req,res){
   res.render('remove');
});

app.get('/delete',function(req,res){
        let q=""
});

app.get('/adminlogin',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/admin_login.ejs'));
});

app.post('/login2',urlencodedParser,function(req,res){

    var email=req.body.email;
    var password=req.body.password;
    let q = "SELECT * FROM Admin WHERE Admin_email = ? and Admin_password=?";
    let data = [email,password]
    let flag = 0
    con.query(q, data, (err,result) => {
        if (err) 
            throw err;
        else if(result.length >0)
        {
            if(result[0].Admin_password == password)
            {
                //p=result[0].User_Id;
                req.session.user=result[0].Admin_id;
                x=req.session.user;
                flag = 1
                console.log("this is session1 => " + req.session.user)
                res.render('homepage');             
            }
         }
         else{
            res.redirect('/')
         }
        
    });  
});

app.get('/hp',function(req,res){
   res.render('homepage');
});

app.get('/admin_profile',function(req,res){
    let qs = "SELECT * FROM Admin WHERE Admin_id=" + req.session.user;
    let row = []  ;
    con.query(qs, (err, result1) => {
      if(err) throw err;
        row= result1[0];
                         console.log(row);
                         res.render('admin_das',{ "store" : row });
    });
});

app.get('/admin_user',function(req,res){
    let ab="SELECT * from userdetail";
    let storeuser=[];
    let userlength;
    //setTimeout(()=> {
       con.query(ab,(error,result)=>{
        if(error) throw error;
       storeuser=result;
       userlength=storeuser.length;
       console.log(storeuser);
        res.render('tot_user',{ "length1" : storeuser, "length2" : userlength });
         });
       // },50);
        
});

app.get('/admin_trans',function(req,res){
    let q="SELECT * from payment_history";
    let row=[];
    let rowlength;
    con.query(q,(error,result)=>{
        if(error) throw error;
       row=result;
       rowlength=result.length;
       console.log(row);
       res.render('tot_trans',{"length3" : row, "length4" : rowlength });
    });
    
});

app.get('/addadmin',function(req,res){
    res.render(path.join('/home/yatharth/Desktop/dbms_project/views'+'/add_admin.ejs'));
});

app.get('/axis',function(req,res){

    bank="Axis Bank";
    amount="1000";
});

app.get('/sbi',function(req,res){

    bank="State Bank of India";
    amount="1500";
});
app.get('/syn',function(req,res){

    bank="Syndicate Bank";
    amount="900";
});
app.get('/can',function(req,res){

    bank="Canara Bank";
    amount="1500";
});
app.get('/kar',function(req,res){

    bank="Karnataka Bank";
    amount="2000";
});

app.listen(8000,function(){
    console.log('listening to server 8000 ');
 });

