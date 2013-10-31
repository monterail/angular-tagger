angular.module "tagger", []

# Angular 1.0.x polyfill for ng-keyup ng-keydown
# Stolen from https://github.com/angular/angular.js/blob/2bb27d4998805fd89db25192f53d26d259ae615f/src/ng/directive/ngEventDirs.js
for directiveName in ["ngKeydown", "ngKeyup", "ngBlur", "ngFocus"]
  do (directiveName) ->
    angular.module("tagger").directive directiveName, ["$parse", ($parse) ->
      (scope, element, attr) ->
        fn = $parse(attr[directiveName])
        eventName = directiveName.substring(2).toLowerCase()
        element.bind eventName, (event) ->
          fn(scope, {$event: event})
          scope.$apply() unless scope.$$phase || scope.$parent.$$phase || scope.$root.$$phase
    ]

angular.module("tagger").directive "taggerContenteditable", ->
  require: "ngModel"
  link: (scope, elm, attrs, ctrl) ->
    elm.attr "contenteditable", true
    ctrl.$render = ->
      elm.text ctrl.$viewValue
    update = ($event) ->
      $event?.preventDefault?() if $event.keyCode == 13
      scope.$apply ->
        ctrl.$setViewValue elm.text()
    elm.bind "keyup", update
    elm.bind "keydown", update

angular.module("tagger").directive "tagger", ["$compile", "$timeout", ($compile, $timeout) ->
  restrict: "AE"
  replace: true
  # priority: 0
  # terminal: true
  template: """
  <span
    class="angular-tagger"
    ng-click="handleOuterClick($event)"
    ng-class="{'angular-tagger--single': config.single}"
    ng-focus="handleOuterFocus($event)">
    <span class="angular-tagger__wrapper">
      <span class="angular-tagger__holder" ng-repeat="tag in tags">
        <span tagger-contenteditable="true"
          ng-model="$parent.query"
          ng-show="pos == $index"
          ng-keydown="handleKeyDown($event)"
          ng-keyup="handleKeyUp($event)"
          ng-click="handleInputClick($event)"
          ng-blur="handleBlur($index, $event)"
          class="angular-tagger__input">
        </span>
        <span class="angular-tagger__tag">
          {{ config.displayFun(tag) }}
          <span
            class="angular-tagger-tag__delete"
            ng-mousedown="handleMousedown()"
            ng-mouseup="handleMouseup()"
            ng-click="removeTag($index, $event)">x</span>
        </span>
      </span>
    </span>
    <span tagger-contenteditable="true"
      ng-model="query"
      ng-show="(config.single && !tags.length) || (!config.single && pos == tags.length)"
      ng-keydown="handleKeyDown($event)"
      ng-keyup="handleKeyUp($event)"
      ng-click="handleInputClick($event)"
      placeholder="{{ placeholder }}"
      ng-blur="handleBlur(tags.length, $event)"
      ng-focus="handleFocus($event)"
      class="angular-tagger__input">
    </span>
    <div class="angular-tagger__hook">
      <ul ng-show="expanded" class="angular-tagger__matching">
        <li class="angular-tagger__matching-item"
          ng-mousedown="handleMousedown()"
          ng-mouseup="handleMouseup()"
          ng-mouseover="selectItem(-1)"
          ng-click="handleItemClick($event)"
          ng-hide="config.disableNew || !query.length || hideNew"
          ng-class='{"angular-tagger__matching-item--selected": selected == -1}'>
          Add: {{ query }}...
        </li>
        <li
          ng-repeat="e in matching"
          ng-mousedown="handleMousedown()"
          ng-mouseup="handleMouseup()"
          ng-mouseover="selectItem($index)"
          ng-click="handleItemClick($event)"
          class="angular-tagger__matching-item"
          ng-class='{"angular-tagger__matching-item--selected": $index == selected}'>
          {{ config.displayFun(e) }}
        </li>
      </ul>
    </div>
  </span>
  """
  scope:
    value:     "=ngModel" # can't use ngModelController, we need isolated scope
    options:  "="


  link: ($scope, element, attrs) ->
    $scope.query = ""
    $scope.expanded = false
    $scope.matching = []
    $scope.selected = 0
    $scope.options ||= []
    $scope.tags ||= []
    $scope.placeholder = null
    $scope.hideNew = false

    $scope.config =
      disableNew: false
      displayFun: ((e) -> e)
      createFun: ((e) -> e)
      limit:      null

    if attrs.disableNew?
      $scope.config.disableNew = attrs.disableNew?

    if attrs.limit?
      $scope.config.limit = parseInt(attrs.limit)

    if attrs.displayFun?
      $scope.config.displayFun = $scope.$parent.$eval(attrs.displayFun)

    if attrs.createFun?
      $scope.config.createFun = $scope.$parent.$eval(attrs.createFun)

    if attrs.placeholder?
      $scope.config.placeholder = attrs.placeholder
      $scope.placeholder = $scope.config.placeholder

    if attrs.single?
      $scope.config.single = true
      $scope.config.limit = 1

    if attrs.onSelect?
      $scope.config.onSelect = $scope.$parent.$eval(attrs.onSelect)

    if $scope.config.disableNew
      $scope.selected = 0


    input = element.children().eq(1)

    _updateMatching = () ->
      $timeout ->
        rx = new RegExp(".*#{$scope.query.split("").join(".*")}.*", "i")

        $scope.hideNew = false
        $scope.matching = []
        for opt in $scope.options
          str = $scope.config.displayFun(opt)
          if rx.test(str)
            $scope.hideNew = true if str.toLowerCase() == $scope.query.toLowerCase()

            found = false
            for t in $scope.tags
              if t == opt
                found = true

            $scope.matching.push opt unless found

        $scope.selected = if $scope.config.disableNew
          0
        else
          if $scope.matching.length > 0
            0
          else
            -1

        $scope.placeholder = if $scope.tags.length > 0 then null else $scope.config.placeholder

    _updateFocus = () ->
      # focusing on hidden element does not work
      $timeout ->
        _currentInput().focus()
        $scope.show()

    _currentInput = () ->
      if $scope.pos == $scope.tags.length then input[0] else element.children().eq(0).children().eq($scope.pos).children()[0]

    _overLimit = () ->
      $scope.config.limit && $scope.tags.length >= $scope.config.limit

    $scope.handleOuterClick = ($event) ->
      $event?.stopPropagation?()
      if $scope.config.single
        $scope.removeTag(0)
        _updateMatching()
      _updateFocus()

    mousedown = false
    $scope.handleMousedown = -> mousedown = true
    $scope.handleMouseup = -> mousedown = false

    $scope.handleKeyUp = ($event) ->
      switch $event.keyCode
        when 8 # Backspace
          _updateMatching()
        when 46 # Delete
          _updateMatching()
        when 27 # Escape
          $scope.hide()
        else
          if 48 < $event.keyCode < 90
            _updateMatching()
            $scope.show()

    $scope.handleKeyDown = ($event) ->
      switch $event.keyCode
        when 38 # Up
          $scope.selected = Math.max($scope.selected - 1, if $scope.config.disableNew then 0 else -1)
          $event.preventDefault()
        when 40 # Down
          $scope.selected = Math.min($scope.selected + 1, $scope.matching.length - 1)
          $event.preventDefault()
        when 13 # Enter
          $scope.addItem()
        when 8 # Backspace
          if $scope.query == "" && $scope.pos > 0
            $scope.removeTag($scope.pos-1)
        when 46 # Delete
          if $scope.query == "" && $scope.pos < $scope.tags.length
            $scope.removeTag($scope.pos)
        when 37 # Left
          if $scope.query == ""
            $scope.pos = Math.max($scope.pos - 1, 0)
            _updateFocus()
        when 39 # Right
          if $scope.query == ""
            $scope.pos = Math.min($scope.pos + 1, $scope.tags.length)
            _updateFocus()

    $scope.handleInputClick = ($event) ->
      $event.stopPropagation()

    $scope.handleItemClick = ($event) ->
      $scope.addItem()
      $event.stopPropagation()

    $scope.handleOuterFocus = ($event) ->
      _currentInput()?.focus?()

    $scope.handleBlur = ($index, $event) ->
      $scope.hide() if $index == $scope.pos && !mousedown

    $scope.handleFocus = ($event) ->
      $scope.show()

    $scope.addItem = () ->
      return if _overLimit()

      item = if $scope.config.disableNew
        if $scope.selected > -1
          $scope.matching[$scope.selected]
        else
          null
      else if $scope.selected == -1 and $scope.query
        $scope.config.createFun($scope.query)
      else if $scope.selected > -1
        $scope.matching[$scope.selected]

      if item
        console.log "adding ", item
        $scope.tags.splice $scope.pos, 0, item
        $scope.query = ""
        _updateMatching()
        $scope.selected = Math.min($scope.selected, $scope.matching.length - 1)
        $scope.pos++
        _updateFocus()

        if $scope.config.single
          $scope.value = $scope.tags[0]

        $timeout -> $scope.config.onSelect?(item)

        $scope.hide() if _overLimit()

    $scope.selectItem = (index) ->
      $scope.selected = index

    $scope.show = () ->
      $scope.expanded = !_overLimit()

    $scope.hide = () ->
      $scope.expanded = false
      $scope.query = ""
      $scope.pos = $scope.tags.length
      $timeout -> _currentInput()?.blur?()

    $scope.removeTag = (pos, $event) ->
      $event?.stopPropagation?()
      $scope.tags.splice(pos, 1)
      if $scope.config.single
          $scope.value = $scope.tags[0]

      if pos < $scope.pos
        $scope.pos--

      if $scope.expanded
        _updateMatching()
        _updateFocus()

      if $scope.config.single
        $scope.value = $scope.tags[0]

    # bootstrap
    _updateMatching()

    $scope.$watch "options", _updateMatching, true
    $scope.$watch "value", ->
      if $scope.config.single
        if $scope.value?
          $scope.tags = [$scope.value]
        else
          $scope.tags = []
      else
        $scope.tags = $scope.value || []

      $scope.pos = $scope.tags.length
    , true
]
