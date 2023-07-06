var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.put('/edit', function(req, res, next) {
  console.log('edit user:', req)
})

// router.post('/add', function(req, res, next) {
// })

module.exports = router;
