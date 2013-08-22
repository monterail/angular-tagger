(function() {
  angular.module("tagger", []);

  angular.module("tagger").directive("tagger", function($compile) {
    return {
      restrict: "AE",
      replace: true,
      template: "<span>\n\n</span>",
      scope: {
        tags: "=ngModel"
      },
      link: function($scope, element, attrs) {}
    };
  });

}).call(this);
