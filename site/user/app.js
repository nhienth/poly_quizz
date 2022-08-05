var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "default.html",
      controller: "loginCtrl",
    })
    .when("/login", {
      templateUrl: "default.html",
      controller: "loginCtrl",
    })
    .when("/register", {
      templateUrl: "register.html",
      controller: "registerCtrl",
    })
    .when("/forget", {
      templateUrl: "forgotPass.html",
    })
    .when("/profile", {
      templateUrl: "profile.html",
      controller: "profileCtrl",
    });
});

app.controller("registerCtrl", function ($scope, $http) {
  $scope.postData = function (even) {
    var data = {
      username: $scope.username,
      fullname: $scope.fullname,
      password: $scope.password,
      email: $scope.email,
    };
    $http.post("http://localhost:3000/student", data).then(
      function (res) {
        alert("Đăng ký thành công!");
      },
      function (err) {
        alert("false");
      }
    );
  };
});

app.controller("loginCtrl", function ($scope, $http) {
  $scope.login = function () {
    var user = localStorage.getItem("user");
    if (user == null) {
      user = [];
    } else {
      user = JSON.parse(user);
    }
    $http.get("http://localhost:3000/student").then(function (res) {
      res.data.forEach((user) => {
        if (
          $scope.username == user.username &&
          $scope.password == user.password
        ) {
          $http
            .get("http://localhost:3000/student/" + user.id)
            .then(function (res) {
              localStorage.setItem("user", JSON.stringify(res.data));
              window.location.href = "../../index.html";
            });
        } else {
          $("#err-login").html("Thông tin đăng nhập không chính xác !");
        }
      });
    });
  };
});
