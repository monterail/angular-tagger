# Pure Angular tagger, without jQuery

```js
angular.module('myApp', ['tagger']);
// ...

$scope.options = ["Text", "Markdown", "HTML", "PHP", "Python",
                  "Java", "JavaScript", "Ruby", "VHDL",
                  "Verilog", "C#", "C/C++"]
$scope.tags = ["Markdown", "Ruby"]
```


```html
<tagger ng-model="tags" options="options"/>
```

## Configuration


Attribute name  | Description
            ----|---
`disable-new`   | Disables adding new item. <br/> Example: `<tagger ng-model="tags" disable-new>`
`limit`         | Limit number of selected values. <br/> Example: `<tagger ng-model="tags" limit="5">`
`display-fun`   | Function for formatting value. <br/> Example: `<tagger ng-model="tags" display-fun="showName">`
`placeholder`   | Placeholder string. <br/> Example: `<tagger ng-model="tags" placeholder="Select something">`
`single`        | Make it a single select with slightly different behavior. <br/> Example: `<tagger ng-model="tags" single>`


## Development

```bash
npm install
bower install
grunt watch
open test/index.html
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

