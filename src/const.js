/*global d3:false, sched:false, _:false*/
sched.budget = 20;

// this is from data.js
sched.projects = sched.data;

// to push stuff towards now
sched.discount = 0.05;

sched.maxValue = _.chain(sched.projects).pluck('value_per_period').max().value();

sched.temp = 1000;

