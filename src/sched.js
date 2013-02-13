/*global data: false, d3:false, sched:false, _:false*/

// TODO: webworker
var best = 0;
_.each(_.range(2),function() {
  sched.current_schedule = sched.byValue();
  sched.anneal(sched.current_schedule);
  var obj = sched.objective(sched.current_schedule);
  console.log('byvalue anneal: ' + obj);
  if (obj > best) {
    best = obj;
    sched.render('1', sched.current_schedule);
    sched.rendercost('1', sched.current_schedule);
  }
});

_.each(_.range(2),function() {
  sched.current_schedule = sched.shuffle();
  sched.anneal(sched.current_schedule);
  var obj = sched.objective(sched.current_schedule);
  console.log('shuffle anneal: ' + obj);
  if (obj > best) {
    best = obj;
    sched.render('2', sched.current_schedule);
    sched.rendercost('2', sched.current_schedule);
  }
});

// no annealing
var greedy = function() {
  // start with nothing
  sched.current_schedule = sched.none();
  var sorted = _.sortBy(sched.projects, function(x){return 0 - x.value_per_period;});
  _.each(sorted, function(s) {
    var t = 0;
    while (!sched.allowed(s, t, sched.current_schedule)) {
      t++;
    }
    sched.current_schedule[s.i] = t;
  });
  var obj = sched.objective(sched.current_schedule);
  console.log('greedy byvalue: ' + obj);
  sched.render('3', sched.current_schedule);
  sched.rendercost('3', sched.current_schedule);
};
greedy();
