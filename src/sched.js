/*global d3:false, _:false*/
// bah
//var _ = require('underscore')._;

// constant to start with, just one kind
var budget = 20;

// no dependencies
// var projects = [
  // {cost_per_period: 8, duration: 1, value_per_period: 1},
  // {cost_per_period: 8, duration: 1, value_per_period: 1}
// ];

var projects = _.map(_.range(40), function(x) {
  return {
    cost_per_period: _.random(1,10),
    duration: _.random(1,10),
    value_per_period: _.random(1,10)
  };
});

// start time, per project
//var schedule = [ 0, 5 ];

// to push stuff towards now
var discount = 0.1;

// discounted value; todo: take value net of cost
var objective = function(theschedule) {
  return _.reduce(projects, function(memo, project, index) {
    var start = theschedule[index];
    // not scheduled
    if (start < 0) { return memo; }
    var end = start + project.duration;
    return _.reduce(_.range(start, end), function(memo2, i) {
      var d = Math.pow((1 - discount), i);
      //if (start > 100) {console.log('discount ' + d);}
      return memo2 + project.value_per_period * d;
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

// can we add this item to the schedule?
var allowed = function(projindex, starttime, theschedule) {
  if (projindex > 100) {console.log(projindex);}
  if (starttime < 0) {return false;}
  var thecost = cost(theschedule);
  var project = projects[projindex];
  return _.every(_.range(starttime, project.duration + starttime), function(i) {
    var c = (thecost[i] || 0);
    //console.log('time ' + starttime + ' current cost ' + c +
       //' incremental cost ' + project.cost_per_period);
    //console.log(project.cost_per_period);
    if (c + project.cost_per_period <= budget) {
      //console.log('allowed');
      return true;
    } else {
      //console.log('not allowed');
      return false;
    }
  });
};

// start with a terrible schedule
var runningTotal = 0;
var current_schedule = _.map(projects, function(x){
  runningTotal += x.duration;
  return runningTotal;
});


// render one row per project



var totalprojects = projects.length;
var totalTime = function(sched){
  return _.reduce(projects, function(memo, x, i) {
    var sch = sched[i];
    if (sch < 0) {
      return memo;
    } else {
      var end = sch + x.duration;
      //console.log('dur ' + x.duration + ' sch ' + sch + ' end ' + end);
      return _.max([end, memo]);
    }
  }, 0);
};

var maxValue = _.chain(projects).pluck('value_per_period').max().value();


// try rendering a simple schedule

var render = function(sched) {
  //console.log('foo');

  var width = 960;
  var height = 450;
  var bm = 30;
  var tm = 30;
  var lm = 50;
  var rm = 30;
  var innerheight = height - bm - tm;
  var innerwidth = width - rm - lm;

  var minOpacity = 0.2;
  var tt = totalTime(sched);

//console.log('total time ' + tt);

  var xscale = d3.scale.linear()
    .domain([0,tt])
    .range([0,innerwidth]);
  var xaxis = d3.svg.axis().scale(xscale).orient('bottom');
  var yscale = d3.scale.ordinal()
    .domain(_.map(projects, function(p,i){return i;}))
    .rangeRoundBands([0, innerheight], 0.1);
  var yaxis = d3.svg.axis().scale(yscale).orient('left');


  var rd = _.compact(_.map(projects, function (p, i) {
    if (_.isUndefined(sched[i]) || sched[i] < 0) {return null;}
    return {
      x: xscale(sched[i]),
      y: yscale(i),
      width: xscale(sched[i] + p.duration) - xscale(sched[i]),
      height: yscale.rangeBand(),
      opacity: (1 - minOpacity) * p.value_per_period / maxValue + minOpacity
    };
  }));

  var svg = d3.select('div#viz').selectAll('svg').data([rd]);
  svg.enter().append('svg');
  svg.exit().remove();
  svg.attr('width',width)
    .attr('height',height)
    .attr('class','myviz');

  var gg = svg.selectAll('g.container').data(function(d){return [d];});
  gg.enter().append('g');
  gg.exit().remove();
  gg.attr('class','container')
    .attr('transform','translate(' + lm + ',' + tm + ')');

  var xs = gg.selectAll('.x.axis').data(['hi']);
  xs.enter().append('g');
  xs.attr('class','x axis').attr('transform','translate(0,'+innerheight+')');
  xs.call(xaxis);
  var ys = gg.selectAll('.y.axis').data(['hi']);
  ys.enter().append('g');
  ys.attr('class','y axis');
  ys.call(yaxis);

  var rect = gg.selectAll('rect.proj').data(function(d){return d;});
  rect.enter().append('rect')
    .attr('class','proj')
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;})
    .attr('opacity', function(d){return d.opacity;});
  rect.exit().remove();
  rect
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;})
    .attr('opacity', function(d){return d.opacity;});

};

var rendercost = function(sched) {
  var width = 960;
  var height = 150;
  var bm = 30;
  var tm = 30;
  var lm = 50;
  var rm = 30;
  var innerheight = height - bm - tm;
  var innerwidth = width - rm - lm;

  var c = cost(sched);
  _.each(_.range(c.length), function(i) {
    if (_.isUndefined(c[i])) {c[i] = 0;}
  });
  //console.log(c);

  var tt = totalTime(sched);
  // console.log('cost length ' + c.length);

  var xscale = d3.scale.linear()
    .domain([0,c.length])
    .range([0,innerwidth]);
  var xaxis = d3.svg.axis().scale(xscale).orient('bottom');

  var yscale = d3.scale.linear()
    .domain([0, _.max(c)])
    .range([innerheight, 0]);
  var yaxis = d3.svg.axis().scale(yscale).orient('left');


  var rd = _.map(c, function (ci, i) {
    return {
      x: xscale(i),
      y: yscale(c[i]),
      width: xscale(1) - xscale(0),
      height: yscale(0) - yscale(c[i])
    };
  });

  var svg = d3.select('div#cost').selectAll('svg').data([rd]);
  svg.enter().append('svg');
  svg.exit().remove();
  svg.attr('width',width)
    .attr('height',height)
    .attr('class','mycost');

  var gg = svg.selectAll('g.container').data(function(d){return [d];});
  gg.enter().append('g');
  gg.exit().remove();
  gg.attr('class','container')
    .attr('transform','translate(' + lm + ',' + tm + ')');

  var xs = gg.selectAll('.x.axis').data(['hi']);
  xs.enter().append('g');
  xs.attr('class','x axis').attr('transform','translate(0,'+innerheight+')');
  xs.call(xaxis);
  var ys = gg.selectAll('.y.axis').data(['hi']);
  ys.enter().append('g');
  ys.attr('class','y axis');
  ys.call(yaxis);

  var rect = gg.selectAll('rect.proj').data(function(d){return d;});
  rect.enter().append('rect')
    .attr('class','proj')
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;});
  rect.exit().remove();
  rect
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;});

};

//render([0,10]);
// start with nothing
render(current_schedule);

var max_movement = totalTime(current_schedule) * 2;
//var iters = 10000;
var iters = totalTime(current_schedule) * 2;

var temp = 1000;

//var mything = setInterval(function(){
  //render(current_schedule);
//}, 500);

_.each(_.range(iters), function(x) {
  _.defer(function() {
  // reduce jiggliness linearly
  var movement = max_movement * (1 - x / iters);
  // touch every project on every iteration
  _.each(projects, function(p, idx) {
    var prevValue = objective(current_schedule);
    //var idx = _.random(totalprojects - 1);
    var mag = _.random(Math.ceil(movement));
    var dir = _.random(100) > 50 ? (-1) : 1;

    var starttime = current_schedule[idx] + dir * mag;
    // need to make a schedule WITHOUT this item in it.
    // TODO: don't do that.
    var omitted = current_schedule.slice();
    omitted[idx] = -1;
    var isallowed = allowed(idx, starttime, omitted);
    if (isallowed) {
  
      // TODO: don't copy it, just override the item
      var candidate_schedule = current_schedule.slice();
      //console.log('idx ' + idx + ' move ' + (dir * mag));
      candidate_schedule[idx] += (dir * mag);
      var newvalue = objective(candidate_schedule);
      // greedy.  TODO: annealed.
      //console.log(Math.exp((newvalue - prevValue) / temp));
      if (newvalue > prevValue) {
        //console.log('iter ' + x + ' new best ' + newvalue);
        //console.log(candidate_schedule);
        current_schedule[idx] = candidate_schedule[idx];
        // render the new one
        render(current_schedule);
        rendercost(current_schedule);
      } else if (Math.exp((newvalue - prevValue) / temp) > Math.random() ) {
        //console.log('iter ' + x + ' accept worse ' + newvalue);
      } else {
        //console.log('allowed but not improved');
      }
  
    } else {
      //console.log('not allowed');
    }
    temp *= 0.98;

  });



});});
//clearInterval(mything);

// one more time
render(current_schedule);
//console.log(current_schedule);
//console.log(cost(current_schedule).join(':'));
rendercost(current_schedule);

_.defer(function(){console.log('done');});
