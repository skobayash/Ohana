// var path = require("path");
var db = require("../models");
var passport = require("../config/passport");

module.exports = function(app) {

  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function(req, res) {
    db.User.findOne({//FINDING USER
        where: {
            email: req.body.email
        }
    }).then(function(result) {
        // console.log("in login api-routes", result.dataValues);
        if (result) {//user found
            var userInfo = result.dataValues;
            db.Family.findOne({//FINDING FAMILY
                where: {
                    id: result.FamilyId
                }            
            }).then(function(data) {
                // console.log("userInfo", userInfo)
            //   console.log('family found!')
              var nickname = data.dataValues.nick_name;
              userInfo.familyNickName = data.dataValues.nick_name;
            //   console.log("userInfo with family nick name", userInfo)
              res.json(userInfo);
            })
        } else {
            console.log('user not found!')
        }
    })
});

  app.post("/api/signup", function(req, res) {
    db.User.create({//CREATING ROW IN USERS TABLE
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
      zipcode: req.body.zipcode,
      primary_user: req.body.primary_user,
      name: req.body.name,
      FamilyId: req.body.familyId
    }).then(function(results) {//REDIRECT USER TO LOGIN PAGE
        res.json('/api/login');
    }).catch(function(err) {
      console.log(err);
      res.json(err);
    });
  });

  app.get("/logout", function(req, res) {//UNUSED AS OF 6/13 AM
    req.logout();
    res.redirect("/");
  });

  app.get("/api/user_data", function(req, res) {//WORKS AS OF 6/13 AM
    var familyNickName;
    if (!req.user) {
      res.json({});
    }
    else {
        // db.Family.findOne({
        //     where: {
        //         id: req.user.FamilyId
        //     }               
        // }).then(function(data){
        //     // console.log("in /api/user_data return family nickname", data.dataValues.nick_name);
        //     // familyNickName = data.dataValues.nick_name;
        //     res.json({
        //         email: req.user.email,
        //         id: req.user.id,
        //         FamilyId: req.user.FamilyId,
        //         name: req.user.name,
        //         familyNickName: data.dataValues.nick_name
        //       });
        // })
      res.json({
        email: req.user.email,
        id: req.user.id,
        FamilyId: req.user.FamilyId,
        name: req.user.name,
        // familyNickName: familyNickName
      });
    }
  });    

  app.post(`/api/user/:username`, function(req,res) {
      db.User.findOne({//FINDING USER
          where: {
              user_name: req.params.username,
          }
      }).then(function(result) {
          if (res) {//user found
              db.Family.findOne({//FINDING FAMILY
                  where: {
                      id: result.FamilyId
                  }            
              }).then(function(data) {
                  var nickname = data.dataValues.nick_name;
                  console.log(nickname);
                  res.redirect("/family/" + nickname);
              })
          } else {
            res.redirect('/')
          }
      })
    });

  app.post("/api/newFamily", function(req, res){
    //   console.log(req.body);
    db.Family.create({
        nick_name: req.body.nick_name
    }).then(function(result){
        console.log("result from database", result);
        res.json(result);
    })
  })

    app.get("/api/events", function(req, res) {//WORKS AS OF 6/13 AM
        db.Occasion.findAll({
        }).then(function(data) {
            res.json(data)
        })
    });

    app.get('/api/events/:userFamId', function(req,res) {
        db.Occasion.findAll({
            where: {
                FamilyId: req.params.userFamId
            }
        }).then(function(data) {
            res.json(data)
        })
    });

    app.get("/api/events/proposed", function(req, res) {//WORKS AS OF 6/13 AM
        db.Occasion.findAll({
            where: {
                proposed: true
            }
        }).then(function(data) {
            res.json(data)
        });
    });

    app.get("/api/events/proposed/:userFamId", function(req, res) {//WORKS AS OF 6/13 AM
        db.Occasion.findAll({
            where: {
                proposed: true,
                FamilyId: req.params.userFamId
            }
        }).then(function(data) {
            res.json(data)
        });
    });

    app.post('/api/events/voteup', function(req,res) {
        db.Occasion.increment('vote', {//INCREMENTING VOTE
            where: {
                id: req.body.id
            }
        }).then(function(data){
            db.Occasion.findOne({//FINDING ROW WHERE IT JUST INCREMENTED
                where: {
                    id: req.body.id
                }
            }).then(function(data2) {
                res.json(data2.dataValues)
            })
        });
    });

    app.post('/api/events/votedown', function(req,res) {
        db.Occasion.decrement('vote', {//DECREMENTING VOTE
            where: {
                id: req.body.id
            }
        }).then(function(data){
            db.Occasion.findOne({//FINDING ROW WHERE IT JUST INCREMENTED
                where: {
                    id: req.body.id
                }
            }).then(function(data2) {
                res.json(data2.dataValues)
            })
        });
    });

    // app.get("/partial/name/:userName", function(req, res){
    //     console.log("in api-routes userName" + req.params.userName);
    //     res.render("/partials/header-navbar", {
    //         userName: req.params.userName
    //     }).then(function(data){
    //         console.log(data);
    //         res.json(data);
    //     })
    // });

};
  
    // app.get(`/api/user/:id`, function(req, res) {
    //     db.User.findOne({
    //         where: {
    //             user_name: req.params.id
    //         }
    //     }).then(function(result) {
            // db.Family.findOne({
            //     where: {
            //         id: result.FamilyId
            //     }
    //         }).then(function(result) {
    //             console.log('SENDING TO LANDING WITH', result.dataValues.nick_name)
    //             res.render('pages/landing')
    //         })
    //     })
    // });
