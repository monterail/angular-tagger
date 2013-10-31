(function() {
  var directiveName, _fn, _i, _len, _ref;

  angular.module("tagger", []);

  _ref = ["ngKeydown", "ngKeyup", "ngBlur", "ngFocus"];
  _fn = function(directiveName) {
    return angular.module("tagger").directive(directiveName, [
      "$parse", function($parse) {
        return function(scope, element, attr) {
          var eventName, fn;
          fn = $parse(attr[directiveName]);
          eventName = directiveName.substring(2).toLowerCase();
          return element.bind(eventName, function(event) {
            fn(scope, {
              $event: event
            });
            if (!(scope.$$phase || scope.$parent.$$phase || scope.$root.$$phase)) {
              return scope.$apply();
            }
          });
        };
      }
    ]);
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    directiveName = _ref[_i];
    _fn(directiveName);
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
        template: "<span\n  class=\"angular-tagger\"\n  ng-click=\"handleOuterClick($event)\"\n  ng-class=\"{'angular-tagger--single': config.single}\"\n  ng-focus=\"handleOuterFocus($event)\">\n  <span class=\"angular-tagger__wrapper\">\n    <span class=\"angular-tagger__holder\" ng-repeat=\"tag in tags\">\n      <span tagger-contenteditable=\"true\"\n        ng-model=\"$parent.query\"\n        ng-show=\"pos == $index\"\n        ng-keydown=\"handleKeyDown($event)\"\n        ng-keyup=\"handleKeyUp($event)\"\n        ng-click=\"handleInputClick($event)\"\n        ng-blur=\"handleBlur($index, $event)\"\n        class=\"angular-tagger__input\">\n      </span>\n      <span class=\"angular-tagger__tag\">\n        {{ config.displayFun(tag) }}\n        <span\n          class=\"angular-tagger-tag__delete\"\n          ng-mousedown=\"handleMousedown()\"\n          ng-mouseup=\"handleMouseup()\"\n          ng-click=\"removeTag($index, $event)\">x</span>\n      </span>\n    </span>\n  </span>\n  <span tagger-contenteditable=\"true\"\n    ng-model=\"query\"\n    ng-show=\"(config.single && !tags.length) || (!config.single && pos == tags.length)\"\n    ng-keydown=\"handleKeyDown($event)\"\n    ng-keyup=\"handleKeyUp($event)\"\n    ng-click=\"handleInputClick($event)\"\n    placeholder=\"{{ placeholder }}\"\n    ng-blur=\"handleBlur(tags.length, $event)\"\n    ng-focus=\"handleFocus($event)\"\n    class=\"angular-tagger__input\">\n  </span>\n  <div class=\"angular-tagger__hook\">\n    <ul ng-show=\"expanded\" class=\"angular-tagger__matching\">\n      <li class=\"angular-tagger__matching-item\"\n        ng-mousedown=\"handleMousedown()\"\n        ng-mouseup=\"handleMouseup()\"\n        ng-mouseover=\"selectItem(-1)\"\n        ng-click=\"handleItemClick($event)\"\n        ng-hide=\"config.disableNew || !query.length\"\n        ng-class='{\"angular-tagger__matching-item--selected\": selected == -1}'>\n        Add: {{ query }}...\n      </li>\n      <li\n        ng-repeat=\"e in matching\"\n        ng-mousedown=\"handleMousedown()\"\n        ng-mouseup=\"handleMouseup()\"\n        ng-mouseover=\"selectItem($index)\"\n        ng-click=\"handleItemClick($event)\"\n        class=\"angular-tagger__matching-item\"\n        ng-class='{\"angular-tagger__matching-item--selected\": $index == selected}'>\n        {{ config.displayFun(e) }}\n      </li>\n    </ul>\n  </div>\n</span>",
        scope: {
          tags: "=ngModel",
          options: "="
        },
        link: function($scope, element, attrs) {
          var input, mousedown, _currentInput, _overLimit, _updateFocus, _updateMatching;
          $scope.query = "";
          $scope.expanded = false;
          $scope.matching = [];
          $scope.selected = 0;
          $scope.options || ($scope.options = []);
          $scope.tags || ($scope.tags = []);
          $scope.pos = $scope.tags.length;
          $scope.placeholder = null;
          $scope.config = {
            disableNew: false,
            displayFun: (function(e) {
              return e;
            }),
            limit: null
          };
          if (attrs.disableNew != null) {
            $scope.config.disableNew = attrs.disableNew != null;
          }
          if (attrs.limit != null) {
            $scope.config.limit = parseInt(attrs.limit);
          }
          if (attrs.displayFun != null) {
            $scope.config.displayFun = $scope.$parent.$eval(attrs.displayFun);
          }
          if (attrs.placeholder != null) {
            $scope.config.placeholder = attrs.placeholder;
            $scope.placeholder = $scope.config.placeholder;
          }
          if (attrs.single != null) {
            $scope.config.single = true;
            $scope.config.limit = 1;
          }
          if (attrs.onSelect != null) {
            $scope.config.onSelect = $scope.$parent.$eval(attrs.onSelect);
          }
          if ($scope.config.disableNew) {
            $scope.selected = 0;
          }
          input = element.children().eq(1);
          _updateMatching = function() {
            var found, opt, rx, t, _j, _k, _len1, _len2, _ref1, _ref2;
            rx = new RegExp(".*" + ($scope.query.split("").join(".*")) + ".*", "i");
            $scope.matching = [];
            _ref1 = $scope.options;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              opt = _ref1[_j];
              if (rx.test($scope.config.displayFun(opt))) {
                found = false;
                _ref2 = $scope.tags;
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  t = _ref2[_k];
                  if (t === opt) {
                    found = true;
                  }
                }
                if (!found) {
                  $scope.matching.push(opt);
                }
              }
            }
            $scope.selected = $scope.config.disableNew ? 0 : $scope.matching.length > 0 ? 0 : -1;
            return $scope.placeholder = $scope.tags.length > 0 ? null : $scope.config.placeholder;
          };
          _updateFocus = function() {
            return $timeout(function() {
              _currentInput().focus();
              return $scope.show();
            });
          };
          _currentInput = function() {
            if ($scope.pos === $scope.tags.length) {
              return input[0];
            } else {
              return element.children().eq(0).children().eq($scope.pos).children()[0];
            }
          };
          _overLimit = function() {
            return $scope.config.limit && $scope.tags.length >= $scope.config.limit;
          };
          $scope.handleOuterClick = function($event) {
            if ($event != null) {
              if (typeof $event.stopPropagation === "function") {
                $event.stopPropagation();
              }
            }
            if ($scope.config.single) {
              $scope.removeTag(0);
              _updateMatching();
            }
            return _updateFocus();
          };
          mousedown = false;
          $scope.handleMousedown = function() {
            return mousedown = true;
          };
          $scope.handleMouseup = function() {
            return mousedown = false;
          };
          $scope.handleKeyUp = function($event) {
            var _ref1;
            switch ($event.keyCode) {
              case 8:
                return _updateMatching();
              case 46:
                return _updateMatching();
              case 27:
                return $scope.hide();
              default:
                if ((48 < (_ref1 = $event.keyCode) && _ref1 < 90)) {
                  _updateMatching();
                  return $scope.show();
                }
            }
          };
          $scope.handleKeyDown = function($event) {
            switch ($event.keyCode) {
              case 38:
                $scope.selected = Math.max($scope.selected - 1, $scope.config.disableNew ? 0 : -1);
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
          $scope.handleOuterFocus = function($event) {
            var _ref1;
            console.log(_currentInput());
            return (_ref1 = _currentInput()) != null ? typeof _ref1.focus === "function" ? _ref1.focus() : void 0 : void 0;
          };
          $scope.handleBlur = function($index, $event) {
            if ($index === $scope.pos && !mousedown) {
              return $scope.hide();
            }
          };
          $scope.handleFocus = function($event) {
            return $scope.show();
          };
          $scope.addItem = function() {
            var item, _base;
            if (_overLimit()) {
              return;
            }
            item = $scope.config.disableNew ? $scope.selected > -1 ? $scope.matching[$scope.selected] : null : $scope.selected === -1 && $scope.query ? $scope.query : $scope.selected > -1 ? $scope.matching[$scope.selected] : void 0;
            if (item) {
              $scope.tags.splice($scope.pos, 0, item);
              $scope.query = "";
              _updateMatching();
              $scope.selected = Math.min($scope.selected, $scope.matching.length - 1);
              $scope.pos++;
              _updateFocus();
              if (typeof (_base = $scope.config).onSelect === "function") {
                _base.onSelect(item);
              }
              if (_overLimit()) {
                return $scope.hide();
              }
            }
          };
          $scope.selectItem = function(index) {
            return $scope.selected = index;
          };
          $scope.show = function() {
            return $scope.expanded = !_overLimit();
          };
          $scope.hide = function() {
            $scope.expanded = false;
            $scope.query = "";
            $scope.pos = $scope.tags.length;
            return $timeout(function() {
              var _ref1;
              return (_ref1 = _currentInput()) != null ? typeof _ref1.blur === "function" ? _ref1.blur() : void 0 : void 0;
            });
          };
          $scope.removeTag = function(pos, $event) {
            if ($event != null) {
              if (typeof $event.stopPropagation === "function") {
                $event.stopPropagation();
              }
            }
            $scope.tags.splice(pos, 1);
            if (pos < $scope.pos) {
              $scope.pos--;
            }
            if ($scope.expanded) {
              _updateMatching();
              return _updateFocus();
            }
          };
          _updateMatching();
          return $scope.$watch("options", _updateMatching, true);
        }
      };
    }
  ]);

}).call(this);
