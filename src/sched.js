/*global data: false, d3:false, sched:false, _:false*/

// TODO: webworker
var best = 0;
/*
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
*/

best = 0;
/*
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
*/

// populate the schedule in the given order,
// using the "allowed" function.
var populateGreedy = function(sorted) {
  var sched_current_schedule = sched.none();
  _.each(sorted, function(s) {
    var t = 0;
    while (!sched.allowed(s, t, sched_current_schedule)) {
      t++;
    }
    sched_current_schedule[s.i] = t;
  });
  return sched_current_schedule;
};

// no annealing
var greedy = function(srt) {
  sched.current_schedule = populateGreedy(srt.sorted);
  var obj = sched.objective(sched.current_schedule);
  console.log('greedy ' + srt.label + ' ' + obj);
  sched.render(srt.idx, sched.current_schedule);
  sched.renderseries(sched.cost, 'cost' + srt.idx, sched.current_schedule);
  sched.renderseries(sched.value, 'val' + srt.idx, sched.current_schedule);
  d3.select('div#viz' + srt.idx).append('h3').text(srt.label + ' obj: ' + obj);
};

/*
greedy({
  sorted: _.sortBy(sched.projects, 
    function(x){return 0 - x.value_per_period;}
  ),
  label: 'by value',
  idx: 3
});
*/

// produces 638.
greedy({
  sorted: _.sortBy(sched.projects,
    function(x){return 0 - (x.value_per_period/x.cost_per_period);}
  ),
  label: 'by roi',
  idx: 4
});

// anneal the sorted list.  start with the ROI list:

var newlist = _.sortBy(sched.projects, function(x){return 0 - (x.value_per_period/x.cost_per_period);});
var popsched = populateGreedy(newlist);
var popobj = sched.objective(popsched);
var temp = 3;

// > 647 is attainable.
_.each(_.range(5000), function(i) {
  // in each iteration, swap two items
  var s1 = _.random(newlist.length - 1);
  var s2 = _.random(newlist.length - 1);
  // make a copy of the schedule
  var maybe = newlist.slice();
  var t = maybe[s1];
  maybe[s1] = maybe[s2];
  maybe[s2] = t;
  var mp = populateGreedy(maybe);
  var mo = sched.objective(mp);
  if (mo > popobj) {
    popobj = mo;
    newlist = maybe;
    popsched = mp;
    console.log('iter ' + i + ' t ' + temp + ' new better ' + popobj);
  } else if (Math.abs(mo - popobj) < 0.0001) {
    // no change
  } else if (Math.exp((mo - popobj) / temp) > Math.random())  {
    popobj = mo;
    newlist = maybe;
    popsched = mp;
    console.log('iter ' + i + ' t ' + temp + ' allow worse ' + popobj);
  } else {
    //console.log('no change');
  }
  temp *= 0.999;
});

console.log('annealed greedy ' + popobj);
sched.render(5, popsched);
sched.renderseries(sched.cost, 'cost5', popsched);
sched.renderseries(sched.value, 'val5', popsched);
d3.select('div#viz5').append('h3').text('annealed greedy obj: ' + popobj);
