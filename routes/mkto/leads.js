var express = require('express');
var router = express.Router();
var mktoLeads = require('../../repositories/mkto/leads');

router.get('/getLeadsByCookie/:cookie', function(req, res, next) {
  mktoLeads.getLeadsByCookie(req.params['cookie'], function (data) {
      res.send(data);
  }); 
});
router.get('/getLeadsByEmail/:email', function(req, res, next) {
  mktoLeads.getLeadsByEmail(req.params['email'], function (data) {
      res.send(data);
  });  
});
router.get('/getLeadById/:id', function(req, res, next) {
  mktoLeads.getLeadByEmail(req.params['id'], function (data) {
      res.send(data);
  });  
});
router.post('/upsertLead/', function(req, res, next) {
  mktoLeads.upsertLead(req.body, function (data) {
      res.send(data);
  });  
});

module.exports = router;
