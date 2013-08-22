angular.module "tagger", []

angular.module("tagger").directive "tagger", ($compile) ->
  restrict: "AE"
  replace: true
  template: """
  <span>

  </span>
  """
  scope:
    tags: "=ngModel" # can't use ngModelController, we need isolated scope

  link: ($scope, element, attrs) ->

