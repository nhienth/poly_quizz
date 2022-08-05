var app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "home.html",
    })
    .when("/subjects", {
      templateUrl: "subjects.html",
      controller: "subjectsCtrl",
    })
    .when("/quiz/:id/:name", {
      templateUrl: "quiz_app.html",
      controller: "quizCtrl",
    })
    .when("/about", {
      templateUrl: "./site/home/about.html",
    })
    .when("/profile/:id", {
      templateUrl: "./site/user/profile.html",
      controller: "profileCtrl",
    });
});

app.controller("subjectsCtrl", function ($scope, $http) {
  $scope.listSubjects = [];
  $http.get("./db/Subjects.js").then(function (res) {
    $scope.listSubjects = res.data;

    $scope.begin = 0;

    $scope.pageCount = Math.ceil($scope.listSubjects.length / 8);

    $scope.first = function () {
      $scope.begin = 0;
    };

    $scope.prev = function () {
      if ($scope.begin > 0) {
        $scope.begin -= 8;
      }
    };

    $scope.next = function () {
      if ($scope.begin < ($scope.pageCount - 1) * 8) {
        $scope.begin += 8;
      }
    };

    $scope.last = function () {
      $scope.begin = ($scope.pageCount - 1) * 8;
    };
  });
});

app.controller(
  "profileCtrl",
  function ($scope, $http, $routeParams, quizFactory) {
    $scope.id = $routeParams.id;
    $http.get("http://localhost:3000/student/" + $scope.id).then((res) => {
      $scope.user = res.data;
    });

    $http
      .get(`http://localhost:3000/student/${$routeParams.id}/result`)
      .then((res) => {
        $scope.results = res.data;
      });
  }
);

app.controller(
  "quizCtrl",
  function ($scope, $http, $routeParams, quizFactory) {}
);

app.directive("quizfpoly", function (quizFactory, $routeParams, $http) {
  return {
    restrict: "AE",
    scope: {},
    templateUrl: "template_quiz.html",
    link: function (scope, elem, attrs) {
      scope.start = function () {
        quizFactory.getQuestions().then(function () {
          scope.subjectName = $routeParams.name;
          scope.id = 0;
          scope.quizOver = false;
          scope.inProgess = true;
          scope.timer();
          scope.getQuestion();
        });
      };
      scope.reset = function () {
        scope.count = 1;
        scope.score = 0;
        scope.inProgess = false;
      };
      scope.getQuestion = function () {
        var quiz = quizFactory.getQuestion(scope.id);
        if (quiz) {
          scope.question = quiz.Text;
          scope.options = quiz.Answers;
          scope.answer = quiz.AnswerId;
          scope.answerMode = true;
        } else {
          scope.quizOver = true;
        }
      };
      scope.checkAnswer = function () {
        if (!$("input[name=answer]:checked").length) return;
        var ans = $("input[name=answer]:checked").val();
        if (ans == scope.answer) {
          scope.score++;
          scope.correctAns = true;
        } else {
          scope.correctAns = false;
        }
        scope.answerMode = false;
      };
      scope.nextQuestion = function () {
        scope.count++;

        scope.id++;
        scope.getQuestion();
      };
      scope.finish = function () {
        scope.quizOver = true;
      };

      scope.timer = function () {
        scope.countDown = 600;
        var timer = null;
        timer = setInterval(function () {
          scope.countDown--;
          scope.hours = Math.floor(scope.countDown / 3600);
          scope.minutes = Math.floor(scope.countDown / 60);
          scope.seconds = Math.floor(scope.countDown - scope.minutes * 60);
          scope.$apply();
          if (scope.minutes == 0 && scope.seconds == 0) {
            scope.quizOver = true;
            setTimeout(() => {
              clearInterval(timer);
            }, 1000);
          }
        }, 1000);
      };
      scope.save = function () {
        var user = localStorage.getItem("user");
        user = JSON.parse(user);
        var data = {
          subject: scope.subjectName,
          studentId: user.id,
          score: scope.score,
        };
        $http.post("http://localhost:3000/result", data).then(
          function (res) {
            alert("Lưu kết quả thành công");
          },
          function (err) {
            alert("false");
          }
        );
      };
      scope.reset();
    },
  };
});

app.factory("quizFactory", function ($http, $routeParams) {
  return {
    getQuestions: function () {
      return $http.get(`./db/Quizs/${$routeParams.id}.js`).then(function (res) {
        questions = res.data;
      });
    },
    getQuestion: function (id) {
      //   var count = questions.length;
      //   if (count > 10) count = 10;
      var randomItem = questions[Math.floor(Math.random() * questions.length)];
      if (id < 10) {
        return randomItem;
      } else {
        return false;
      }
    },
  };
});

app.controller("myCtrl", function ($scope) {
  $scope.singout = function () {
    console.log("abc");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  };
  $scope.checkLogin = function () {
    var user = localStorage.getItem("user");
    var htmls = "";
    if (user == null) {
      htmls = `
      <a href="./site/user/login.html" class="btn btn-primary rounded-pill">
        Đăng nhập
      </a>
      `;
      $scope.logout = false;
    } else {
      user = JSON.parse(user);

      htmls = `
        <div class="dropdown float-right">
          <button type="button" class="btn btn-primary rounded-pill dropdown-toggle" data-toggle="dropdown">
            ${user.username}
          </button>
          <div class="dropdown-menu">
            <a class="dropdown-item" href="#!profile/${user.id}">Hồ sơ</a>
            <a class="dropdown-item" href="">Đổi mật khẩu</a>
            <a class="dropdown-item" href="">Lịch sử thi</a>
            <a class="dropdown-item" ng-click="dangxuat()" href="">Đăng xuất</a>
          </div>
        </div>
        `;

      $scope.logout = true;
    }
    $(".header__action").html(htmls);
  };
  $scope.checkLogin();
});
