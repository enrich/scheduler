# scheduler

playing with scheduler algos in javascript

## the problem:

* there are budgets, one per resource type, each a time-series.
* there are projects.
* a project may have dependencies.
* the dependency relations are many-to-many, acyclical
* a project may have revenue.
* project revenue is a fixed schedule relative to the project start date
* except that, after an absolute expiration time (by project), revenue is zero.
* a project has costs, in several budgets.
* project cost is a fixed schedule relative to project start date.
* not all the costs of a single project are correlated or even of the same duration.
* there is a constant discount factor
* projects may not be scheduled at all
 
the goal is to maximize the expected (mean) time-discounted revenue.
(or perhaps the median ;-)

it's an np-complete problem, best to use some domain-specific heuristics.

* any schedule which starts after its expiration will have zero revenue,
the lower-bound on value, the same as not scheduling it.

* a lower bound on start time is the path length through the dependency tree;
the upper bound on value for an individual project occurs when its start time
is the path length.

* taking all the start-time lower bounds constitutes an (likely unreachable)
upper bound on total value.

## Multiple Methods

I think it would be good to use several solution methods, and compare them,
rather than trying for one opaque one.

Here are some I thought of:

* Greedy (sort by revenue, walk back in the dependency tree, schedule whole trees at once, with minimum float.
* Emergencies first (schedule trees whose revenue endpoint is closest to, or beyond, the expiration)
* Shortest path first (i.e. soonest revenue)
* Random (subject to constraints)
* Hardest first (highest effort project)
* Easiest first (lowest effort)
* Annealed (choose start times randomly, subject to constraint, with lots of float, then change one project start at a time, subject to constraint)

Are there more ideas?
