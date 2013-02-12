console.log('start');
var _ = require('underscore')._;

// constant to start with, just one kind
var budget = 10;

// no dependencies
var projects = [
  {cost_per_period: 8, duration: 1, value_per_period: 1},
  {cost_per_period: 8, duration: 1, value_per_period: 1}
];

// start time, per project
var schedule = [ 0, 5 ];

// to push stuff towards now
var discount = 0.1;

// discounted value
var objective = function(theschedule) {
  return _.reduce(projects, function(memo, project, index) {
    var start = theschedule[index];
    // not scheduled
    if (start < 0) { return memo; }
    var end = start + project.duration;
    return _.reduce(_.range(start, end), function(memo2, i) {
      return memo2 + project.value_per_period * Math.pow((1 - discount), i);
    }, memo);
  }, 0);
};

var cost = function(theschedule) {
  return _.reduce(projects, function(memo, project, index) {
    var start = theschedule[index];
    // not scheduled
    if (start < 0) { return memo; }
    var end = start + project.duration;
    _.each(_.range(start, end), function(i) {
      memo[i] = (memo[i] || 0) + project.cost_per_period;
    });
    return memo;
  }, []);
};

console.log('objective');
console.log(objective(schedule));
console.log('cost');
console.log(cost(schedule));

// can we add this item to the schedule?
var allowed = function(projindex, starttime, theschedule) {
  var thecost = cost(theschedule);
  var project = projects[projindex];
  return _.every(_.range(starttime, project.duration + starttime), function(i) {
    console.log('i ' + i);
    console.log('cost ' + (thecost[i] || 0));
    console.log(project.cost_per_period);
    console.log(budget);
    return (((thecost[i] || 0) + project.cost_per_period) <= budget);
  });
};

console.log(allowed(1, 0, [0,-1]));
console.log(allowed(1, 1, [0,-1]));
