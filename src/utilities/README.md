Utilities
==========
The utilities folder contains helper/utility code. This code is not specific to
any specific view.

Validation
==========
The `validation.js` file contains logic for easily validating forms. It follows
the state linking pattern. The next few sections explain how to use the links.

## Linked components
The `LinkedComponent` is a React `Component` with a single helper method included:
`linkTo`. The `linkTo` method automatically attachs the component reference to
the returned `Link` instance. Note that this could be done manually, but having a
wrapper component makes things easier to write and read by automating some of the
boilerplate.

```
import { LinkedComponent } from 'utilities';

class MyFormComponent extends LinkedComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };
  }
  ...
}
```

## Creating a link to component state
A `Link` is an abstraction around a property in the component state intended to
be used with controlled inputs. A `Link` contains logic for rejecting, mapping,
validating a controlled inputs value.

```
class MyFormComponent extends LinkedComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };
  }
  

}
```
