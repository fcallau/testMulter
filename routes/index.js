var express = require('express'),
	router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	var domain = process.env.ENVIRONMENT === 'dev' ? 'http://localhost:5407' : 'https:api.tryurapp.com',
		main_data = {
			title: 'Tryurapp Api',
			create_user_url: domain + '/api/users/register',
			auth_user_url: domain+ '/api/users/authenticate',
		}
	res.render('index', main_data);
});

module.exports = router; 
