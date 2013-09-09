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

  angular.module("tagger").directive("tagger", [
    "$compile", "$timeout", function($compile, $timeout) {
      return {
        restrict: "AE",
        replace: true,
        template: "<span class=\"angular-tagger\">\n  <span>\n    <span ng-repeat=\"tag in tags\">\n      <input type=\"text\"\n        ng-model=\"$parent.query\"\n        ng-show=\"pos == $index\"\n        ng-keydown=\"handleKeyDown($event)\"\n        ng-keyup=\"handleKeyUp($event)\"\n        ng-click=\"handleInputClick($event)\"\n        class=\"angular-tagger_input\" />\n      <span class=\"angular-tagger_tag\">\n        {{ tag }}\n        <span class=\"angular-tagger_tag_delete\" ng-click=\"removeTag($index)\">x</span>\n      </span>\n    </span>\n  </span>\n  <input type=\"text\"\n    ng-model=\"query\"\n    ng-show=\"pos == tags.length\"\n    ng-keydown=\"handleKeyDown($event)\"\n    ng-keyup=\"handleKeyUp($event)\"\n    ng-click=\"handleInputClick($event)\"\n    class=\"angular-tagger_input\" />\n  <ul ng-show=\"expanded\" class=\"angular-tagger_matching\">\n    <li class=\"angular-tagger_matching_item_new\"\n      ng-mouseover=\"selectItem(-1)\"\n      ng-click=\"handleItemClick($event)\"\n      ng-class='{\"angular-tagger_matching_item_selected\": selected == -1}'>\n      Add: {{ query }}...\n    </li>\n    <li\n      ng-repeat=\"e in matching\"\n      ng-mouseover=\"selectItem($index)\"\n      ng-click=\"handleItemClick($event)\"\n      class=\"angular-tagger_matching_item\"\n      ng-class='{\"angular-tagger_matching_item_selected\": $index == selected}'>\n      {{ e }}\n    </li>\n  </ul>\n</span>",
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
            $scope.tags.splice($scope.pos, 0, $scope.matching[$scope.selected] || $scope.query);
            $scope.query = "";
            _updateMatching();
            $scope.selected = Math.min($scope.selected, $scope.matching.length - 1);
            $scope.pos++;
            return _updateFocus();
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
