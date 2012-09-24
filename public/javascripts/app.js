var host = window.location.hostname;



function ChatController($scope, $http) {
	navigator.id.watch({
		onlogin: function(assertion) {
			$http.post('/login', {assertion:assertion}).
				success(function(data, status, headers, config) {
					$http.get('/contacts').success(function (_data) {
						$scope.contacts = _data;
					});
				}).
				error(function(data, status, headers, config) {

				});
		},
		onlogout: function() {
			$http.post('/logout').
				success(function(data, status, headers, config) {
					$scope.contacts = [];
				}).
				error(function(data, status, headers, config) {

				});
		}
	});


	$scope.login = function () {
		navigator.id.request();
	};

	$scope.logout = function () {
		navigator.id.logout();
	};

	$scope.openChat = function (contact) {
		alert(contact._id);
	}
}