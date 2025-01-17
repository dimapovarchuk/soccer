var mongoose = require('mongoose');

var User = mongoose.model('User');
var jwt = require("jsonwebtoken");
var fs = require("fs")
console.log(__dirname + '/../../private.key')
var privateKey = fs.readFileSync(__dirname + '/../../private.key');
exports.loginRequired = (req, res, next) =>{
  if (req.user) {
    next();
  } else {
    return res.status(401).json({message: "unauthorized user!"})
  }
}
exports.checkPermissions = (req, res, next) => {
  var id = req.user._id;
  User.findOne({ id: id}, (err, user) => {
    if (err) throw err;
    if (user.role == 'customer') {
      next()
    } else {
      res.status(403).json({message: "forbiden"})
    }
  })
}
exports.checkPermissionsAdmin = (req, res, next) => {
  var id = req.user._id;
  User.findOne({ _id: id}, (err, user) => {
    if (err) throw err;
    if (user.role == 'admin') {
      next()
    } else {
      res.status(403).json({message: "forbiden"})
    }
  })
}
exports.room = (req, res) => {
  var id = req.user._id;
  User.findOne({_id: id }, (err, user) => {
    if (err) throw err;
    res.json({data: user })
  })
}
exports.sign_up_form = (req, res)=>{
  res.render('sign_up', {title: 'Новий користувач'})
}
exports.list = (req, res)=>{
  User.find({}, (err, users)=>{
    res.send(users)
  })
}
exports.remove_all = (req,res)=>{
  User.remove({}, (err) => {
    res.send('all records removed')
  })
}
exports.render_sign_in_form = (req,res)=>{
  res.render('sign_in', {title: 'увійти'})
}
exports.login = (req,res) => {

  User.findOne({email:req.body.email }, (err, user) =>{
    if (err){
        res.status(500).send(err)
    }else if (user){
      user.comparePassword(req.body.password, (error, match) => {
          if(!match) {
              return res.status(400).send({ message: "The password is invalid" });

          }else{
            var token = jwt.sign({
              email: user.email,
              name: user.name,
              _id: user._id
            }, privateKey, {algorithm: 'HS256'});
            res.json({
              message: "The username and password combination is correct",
              token: token,
              user_type: user.role
            });
              //res.send({ message: "The username and password combination is correct!" });
          }
      });


    }else{
      res.status(404).send('not found')
    }
  })

}
exports.create = (req, res) =>{
  //req.body.password = Bcrypt.hashSync(req.body.password, 10);
  var user = new User(req.body)
  user.save((err, item)=>{
    if( err ) {
      res.status(420).send(err)
    } else {
      res.send(item)
    }
  })
}
