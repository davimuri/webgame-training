import Animator from "./Animator";

export default class PropertyAnimator extends Animator {
  #props;
  #easingFunction;

  constructor(duration, props) {
    super(duration);
    this.#props = props;
  }

  setEasingFunction(easingFunction) {
    super._throwIfStarted();
    if (typeof easingFunction != "function") {
      throw "easingFunction must be a function";
    }
    this.#easingFunction = easingFunction;
  }

  // Called before returning the fraction value, redefining this function we
  // set the custom easing behavior instead of default one 
  _timingEventPreprocessor(fraction) {
    fraction = super._timingEventPreprocessor(fraction);
    if (this.#easingFunction) {
      fraction = this.#easingFunction(fraction);
      // In case if easing function returns the value more than 1 or less
      // than 0, trim it to fit the allowed interval
      if (fraction > 1) {
        fraction = 1;
      }
      if (fraction < 0) {
        fraction = 0;
      }
    }
    return fraction;
  }

  // Called after the fraction is calculated, at the end of update function.
  // This hook allows to perform few extra actions before returning the fraction value. 
  // In our case, we call setters of the object
  _onUpdate(fraction) {
    this.#props.forEach((item) => {
      item.setter((1 - fraction)*item.start + fraction*item.end);
    });
  }
}