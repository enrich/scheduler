/*global data: false, d3:false, sched:false, _:false*/
sched.render = function(addr, schedule) {

  var width = 960;
  var height = 450;
  var bm = 30;
  var tm = 30;
  var lm = 50;
  var rm = 30;
  var innerheight = height - bm - tm;
  var innerwidth = width - rm - lm;

  var minOpacity = 0.2;
  var tt = sched.totalTime(schedule);

  var xscale = d3.scale.linear()
    .domain([0,tt])
    .range([0,innerwidth]);
  var xaxis = d3.svg.axis().scale(xscale).orient('bottom');
  var cumcost = 0;
  var costs = _.map(_.pluck(sched.projects, 'cost_per_period'),
    function(cpp) {cumcost += cpp; return cumcost - cpp;});
  var yscale = d3.scale.ordinal()
    .domain(_.map(sched.projects, function(p,i){return i;}))
    .range(_.map(costs, function(cc) { return cc * innerheight / cumcost; }));
  var yaxis = d3.svg.axis().scale(yscale).orient('left');


  var rd = _.compact(_.map(sched.projects, function (p, i) {
    if (_.isUndefined(schedule[i]) || schedule[i] < 0) {return null;}
    return {
      x: xscale(schedule[i]),
      y: yscale(i),
      width: xscale(schedule[i] + p.duration) - xscale(schedule[i]),
      height: p.cost_per_period * innerheight / cumcost,
      opacity: (1 - minOpacity) * p.value_per_period / sched.maxValue + minOpacity
    };
  }));

  var svg = d3.select('div#viz' + addr).selectAll('svg').data([rd]);
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
  rect.transition().duration(50)
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;})
    .attr('opacity', function(d){return d.opacity;});

};

sched.rendercost = function(addr, schedule) {
  var width = 960;
  var height = 150;
  var bm = 30;
  var tm = 30;
  var lm = 50;
  var rm = 30;
  var innerheight = height - bm - tm;
  var innerwidth = width - rm - lm;

  var c = sched.cost(schedule);
  _.each(_.range(c.length), function(i) {
    if (_.isUndefined(c[i])) {c[i] = 0;}
  });

  var tt = sched.totalTime(schedule);

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

  var svg = d3.select('div#cost' + addr).selectAll('svg').data([rd]);
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
  rect.transition().duration(50)
    .attr('x', function(d){return d.x;})
    .attr('y', function(d){return d.y;})
    .attr('width', function(d){return d.width;})
    .attr('height', function(d){return d.height;});

};
