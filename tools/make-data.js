/*global data: false, d3:false, _:false*/
var _ = require('underscore')._;

var projects = _.map(_.range(40), function(x, i) {
  return {
    cost_per_period: _.random(1,10),
    duration: _.random(1,10),
    value_per_period: _.random(1,10),
    i: i
  };
});

console.log(JSON.stringify(projects, null, 2));
