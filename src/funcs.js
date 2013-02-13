/*global data: false, d3:false, sched:false, _:false*/

/*

functions, e.g. value, cost, etc

*/

// discounted value; todo: take value net of cost
sched.objective = function(theschedule) {
  return _.reduce(sched.projects, function(memo, project, index) {
    var start = theschedule[index];
    if (start < 0) { return memo; }
    var end = start + project.duration;
    return _.reduce(_.range(start, end), function(memo2, i) {
      var d = Math.pow((1 - sched.discount), i);
      return memo2 + project.value_per_period * d;
    }, memo);
  }, 0);
};

// single dimension.
sched.cost = function(theschedule) {
  return _.reduce(sched.projects, function(memo, project, index) {
    var start = theschedule[index];
    if (start < 0) { return memo; }
    var end = start + project.duration;
    _.each(_.range(start, end), function(i) {
      memo[i] = (memo[i] || 0) + project.cost_per_period;
    });
    return memo;
  }, []);
};

sched.value = function(theschedule) {
  return _.reduce(sched.projects, function(memo, project, index) {
    var start = theschedule[index];
    if (start < 0) { return memo; }
    var end = start + project.duration;
    _.each(_.range(start, end), function(i) {
      memo[i] = (memo[i] || 0) + project.value_per_period;
    });
    return memo;
  }, []);
};

// can we add this item to the schedule?
sched.allowed = function(project, starttime, theschedule) {
  if (starttime < 0) {return false;}
  var thecost = sched.cost(theschedule);
  return _.every(_.range(starttime, project.duration + starttime), function(i) {
    var c = (thecost[i] || 0);
    if (c + project.cost_per_period <= sched.budget) {
      return true;
    } else {
      return false;
    }
  });
};

// start by sorting by value
sched.runningTotal = 0;
sched.byValue = function() {
  var result = [];
  _.each(_.sortBy(sched.projects, function(x){return 0 - x.value_per_period;}), function(x){
    sched.runningTotal += x.duration;
    result[x.i] = sched.runningTotal;
  });
  return result;
};
sched.shuffle = function() {
  var result = [];
  _.each(_.shuffle(sched.projects), function(x){
    sched.runningTotal += x.duration;
    result[x.i] = sched.runningTotal;
  });
  return result;
};
sched.none = function() {
  return _.map(sched.projects, function() {return -1;});
};

sched.totalprojects = sched.projects.length;
sched.totalTime = function(schedule){
  return _.reduce(sched.projects, function(memo, x, i) {
    var sch = schedule[i];
    if (sch < 0) {
      return memo;
    } else {
      var end = sch + x.duration;
      return _.max([end, memo]);
    }
  }, 0);
};

sched.maxValue = _.chain(sched.projects).pluck('value_per_period').max().value();




