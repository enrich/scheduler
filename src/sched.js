/*global data: false, d3:false, sched:false, _:false*/

// TODO: webworker
var best = 0;
_.each(_.range(2),function() {
  sched.current_schedule = sched.shuffle();
  sched.anneal(sched.current_schedule);
  var obj = sched.objective(sched.current_schedule);
  console.log('shuffle anneal: ' + obj);
  if (obj > best) {
    best = obj;
  }
});
sched.render('1', sched.current_schedule);
sched.renderseries(sched.cost, 'cost1', sched.current_schedule);
sched.renderseries(sched.value, 'val1', sched.current_schedule);
d3.select('div#viz1').append('h3').text('obj: ' + best);

best = 0;
_.each(_.range(2),function() {
  sched.current_schedule = sched.byValue();
  sched.anneal(sched.current_schedule);
  var obj = sched.objective(sched.current_schedule);
  console.log('byvalue anneal: ' + obj);
  if (obj > best) {
    best = obj;
  }
});
sched.render('2', sched.current_schedule);
sched.renderseries(sched.cost, 'cost2', sched.current_schedule);
sched.renderseries(sched.value, 'val2', sched.current_schedule);
d3.select('div#viz2').append('h3').text('obj: ' + best);

// no annealing
var greedy = function(srt) {
  // start with nothing
  sched.current_schedule = sched.none();
  var sorted = _.sortBy(sched.projects, srt.sorter);
  _.each(sorted, function(s) {
    var t = 0;
    while (!sched.allowed(s, t, sched.current_schedule)) {
      t++;
    }
    sched.current_schedule[s.i] = t;
  });
  var obj = sched.objective(sched.current_schedule);
  console.log('greedy ' + srt.label + ' ' + obj);
  sched.render(srt.idx, sched.current_schedule);
  sched.renderseries(sched.cost, 'cost' + srt.idx, sched.current_schedule);
  sched.renderseries(sched.value, 'val' + srt.idx, sched.current_schedule);
  d3.select('div#viz' + srt.idx).append('h3').text(srt.label + ' obj: ' + obj);
};
greedy({
  sorter: function(x){return 0 - x.value_per_period;},
  label: 'by value',
  idx: 3
});
greedy({
  sorter: function(x){return 0 - (x.value_per_period/x.cost_per_period);},
  label: 'by roi',
  idx: 4
});
