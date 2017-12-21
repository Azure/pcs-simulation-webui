Store
==========
The store folder contains all of the logic related to creating, updating
and accessing the [Redux](https://redux.js.org/) store. For handling async
actions in the store, we are using the [Redux-Observbale](https://redux-observable.js.org/)
middleware making use of [RxJs](http://reactivex.io/rxjs/). You will notice
that there isn't a file or folder contain actions. The reason for this is
that, in an effort to avoid boilerplate, much of that functionality has
been wrapped in the store utilities (found `utilities.js`). These utilites
are discussed in the following sections.

Reducers and epics are tightly linked concepts. Because of this, we attempt
to define epics and reducers together as much as possible. Each grouping is
considered a scenario. A reducer scenario is all the logic for creating and
updating a reducer

## How to create a Reducer
Creating reducers is handled using the `createReducerScenario` utility.


## How to create epics
Creating epics is handled using the `createEpicScenario` utility.
