/*global data: false, d3:false, sched:false, _:false*/

(function() {

this.anneal = function(current_schedule) {
  var iters = sched.totalTime(current_schedule) * 5;
  _.each(_.range(iters), function(x) {
    //if (x % 100 === 0) {
      //console.log('iter ' + x + ' temp ' + sched.temp + ' value ' + sched.objective(current_schedule));
    //}
    // jiggliness proportional to temperature
    var movement = sched.temp * (1 - x / iters) / 5;
    // touch every project on every iteration
    _.each(_.shuffle(_.range(sched.projects.length)), function(idx) {
      var p = sched.projects[idx];
      var prevValue = sched.objective(current_schedule);
      var mag = _.random(Math.ceil(movement));
      var dir = _.random(100) > 50 ? (-1) : 1;

      var move = dir * mag;
      var starttime = current_schedule[idx] + move;
      // need to make a schedule WITHOUT this item in it.
      // TODO: don't do that.
      var omitted = current_schedule.slice();
      omitted[idx] = -1;
      var isallowed = sched.allowed(p, starttime, omitted);
      if (isallowed) {
        // TODO: don't copy it, just override the item
        var candidate_schedule = current_schedule.slice();
        candidate_schedule[idx] += move;
        var newvalue = sched.objective(candidate_schedule);
        if (newvalue > prevValue) {
          current_schedule[idx] = candidate_schedule[idx];
          if (current_schedule[idx] < 0) {current_schedule[idx] = -1;}
        } else if (Math.abs(newvalue - prevValue) < 0.001) {
        } else if (Math.exp((newvalue - prevValue) / sched.temp) > Math.random() ) {
          current_schedule[idx] = candidate_schedule[idx];
        } else {
        }
      } else {
      }
      sched.temp *= 0.999;
    });
  });
};
}).apply(sched);
