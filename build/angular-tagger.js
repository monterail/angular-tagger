(function() {
  var directiveName, eventName, _fn, _i, _len, _ref, _ref1;

  angular.module("tagger", []);

  _ref = [["ngKeydown", "keydown"], ["ngKeyup", "keyup"]];
  _fn = function(directiveName, eventName) {
    return angular.module("tagger").directive(directiveName, [
      "$parse", function($parse) {
        return function(scope, element, attr) {
          var fn;
          fn = $parse(attr[directiveName]);
          return element.bind(eventName, function(event) {
            return scope.$apply(function() {
              return fn(scope, {
                $event: event
              });
            });
          });
        };
      }
    ]);
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    _ref1 = _ref[_i], directiveName = _ref1[0], eventName = _ref1[1];
    _fn(directiveName, eventName);
  }

  angular.module("tagger").directive("taggerContenteditable", function() {
    return {
      require: "ngModel",
      link: function(scope, elm, attrs, ctrl) {
        var update;
        elm.attr("contenteditable", true);
        ctrl.$render = function() {
          return elm.text(ctrl.$viewValue);
        };
        update = function($event) {
          if ($event.keyCode === 13) {
            if ($event != null) {
              if (typeof $event.preventDefault === "function") {
                $event.preventDefault();
              }
            }
          }
          return scope.$apply(function() {
            return ctrl.$setViewValue(elm.text());
          });
        };
        elm.bind("keyup", update);
        return elm.bind("keydown", update);
      }
    };
  });

  angular.module("tagger").directive("tagger", [
    "$compile", "$timeout", function($compile, $timeout) {
      return {
        restrict: "AE",
        replace: true,
        template: "<span class=\"angular-tagger\">\n  <span class=\"angular-tagger__wrapper\">\n    <span class=\"angular-tagger__holder\" ng-repeat=\"tag in tags\">\n      <span tagger-contenteditable=\"true\"\n        ng-model=\"$parent.query\"\n        ng-show=\"pos == $index\"\n        ng-keydown=\"handleKeyDown($event)\"\n        ng-keyup=\"handleKeyUp($event)\"\n        ng-click=\"handleInputClick($event)\"\n        class=\"angular-tagger__input\">\n      </span>\n      <span class=\"angular-tagger__tag\">\n        {{ tag }}\n        <span class=\"angular-tagger-tag__delete\" ng-click=\"removeTag($index)\">x</span>\n      </span>\n    </span>\n  </span>\n  <span tagger-contenteditable=\"true\"\n    ng-model=\"query\"\n    ng-show=\"pos == tags.length\"\n    ng-keydown=\"handleKeyDown($event)\"\n    ng-keyup=\"handleKeyUp($event)\"\n    ng-click=\"handleInputClick($event)\"\n    class=\"angular-tagger__input\">\n  </span>\n  <div class=\"angular-tagger__hook\">\n    <ul ng-show=\"expanded\" class=\"angular-tagger__matching\">\n      <li class=\"angular-tagger__matching-item\"\n        ng-mouseover=\"selectItem(-1)\"\n        ng-click=\"handleItemClick($event)\"\n        ng-class='{\"angular-tagger__matching-item--selected\": selected == -1}'>\n        Add: {{ query }}...\n      </li>\n      <li\n        ng-repeat=\"e in matching\"\n        ng-mouseover=\"selectItem($index)\"\n        ng-click=\"handleItemClick($event)\"\n        class=\"angular-tagger__matching-item\"\n        ng-class='{\"angular-tagger__matching-item--selected\": $index == selected}'>\n        {{ e }}\n      </li>\n    </ul>\n  </div>\n</span>",
        scope: {
          tags: "=ngModel",
          options: "="
        },
        link: function($scope, element, attrs) {
          var input, _currentInput, _updateFocus, _updateMatching;
          $scope.query = "";
          $scope.expanded = false;
          $scope.matching = [];
          $scope.selected = -1;
          $scope.options || ($scope.options = []);
          $scope.tags || ($scope.tags = []);
          $scope.pos = $scope.tags.length;
          input = element.children().eq(1);
          _updateMatching = function() {
            var found, opt, rx, t, _j, _k, _len1, _len2, _ref2, _ref3, _results;
            rx = new RegExp(".*" + ($scope.query.split("").join(".*")) + ".*", "i");
            $scope.matching = [];
            _ref2 = $scope.options;
            _results = [];
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              opt = _ref2[_j];
              if (rx.test(opt)) {
                found = false;
                _ref3 = $scope.tags;
                for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                  t = _ref3[_k];
                  if (t === opt) {
                    found = true;
                  }
                }
                if (!found) {
                  _results.push($scope.matching.push(opt));
                } else {
                  _results.push(void 0);
                }
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          };
          _updateFocus = function() {
            return $timeout(function() {
              return _currentInput().focus();
            });
          };
          _currentInput = function() {
            if ($scope.pos === $scope.tags.length) {
              return input[0];
            } else {
              return element.children().eq(0).children().eq($scope.pos).children()[0];
            }
          };
          $scope.handleKeyUp = function($event) {
            var _ref2;
            switch ($event.keyCode) {
              case 8:
                return _updateMatching();
              case 46:
                return _updateMatching();
              case 27:
                return $scope.hide();
              default:
                if ((65 < (_ref2 = $event.keyCode) && _ref2 < 90)) {
                  _updateMatching();
                  $scope.show();
                  return $scope.selected = -1;
                }
            }
          };
          $scope.handleKeyDown = function($event) {
            switch ($event.keyCode) {
              case 38:
                $scope.selected = Math.max($scope.selected - 1, -1);
                return $event.preventDefault();
              case 40:
                $scope.selected = Math.min($scope.selected + 1, $scope.matching.length - 1);
                return $event.preventDefault();
              case 13:
                return $scope.addItem();
              case 8:
                if ($scope.query === "" && $scope.pos > 0) {
                  return $scope.removeTag($scope.pos - 1);
                }
                break;
              case 46:
                if ($scope.query === "" && $scope.pos < $scope.tags.length) {
                  return $scope.removeTag($scope.pos);
                }
                break;
              case 37:
                if ($scope.query === "") {
                  $scope.pos = Math.max($scope.pos - 1, 0);
                  return _updateFocus();
                }
                break;
              case 39:
                if ($scope.query === "") {
                  $scope.pos = Math.min($scope.pos + 1, $scope.tags.length);
                  return _updateFocus();
                }
            }
          };
          $scope.handleInputClick = function($event) {
            return $event.stopPropagation();
          };
          $scope.handleItemClick = function($event) {
            $scope.addItem();
            return $event.stopPropagation();
          };
          $scope.addItem = function() {
            if ($scope.selected > -1 || $scope.query) {
              if ($scope.selected === -1 && $scope.query) {
                $scope.tags.splice($scope.pos, 0, $scope.query);
              } else if ($scope.selected > -1) {
                $scope.tags.splice($scope.pos, 0, $scope.matching[$scope.selected]);
              }
              $scope.query = "";
              _updateMatching();
              $scope.selected = Math.min($scope.selected, $scope.matching.length - 1);
              $scope.pos++;
              return _updateFocus();
            }
          };
          $scope.selectItem = function(index) {
            return $scope.selected = index;
          };
          $scope.show = function() {
            return $scope.expanded = true;
          };
          $scope.hide = function() {
            $scope.expanded = false;
            _currentInput().blur();
            return $scope.pos = $scope.tags.length;
          };
          $scope.removeTag = function(pos) {
            $scope.tags.splice(pos, 1);
            if (pos < $scope.pos) {
              $scope.pos--;
            }
            _updateMatching();
            return _updateFocus();
          };
          angular.element(document).bind("click", function(e) {
            return $scope.$apply(function() {
              return $scope.hide();
            });
          });
          _updateMatching();
          return input.bind("focus", function() {
            return $scope.$apply(function() {
              return $scope.show();
            });
          });
        }
      };
    }
  ]);

}).call(this);
