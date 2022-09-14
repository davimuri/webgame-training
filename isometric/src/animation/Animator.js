/**
 * This is the base class to support the animation.
 * @param duration - the duration of the one loop of the animation in milliseconds.
 * For example, for a 6-frame animation where each frame is staying on the
 * screen for 50 milliseconds the duration will be 300 milliseconds.
 *
 * The constructor accepts the bare minimum of parameters: the rest is set via setters:
 * setRepeatBehavior and setRepeatCount (see the function docs for the details)
 *
 * Animator doesn't handle the timing internally. It should be used with the external
 * timer. The external timer calls the update() function, passing the number of milliseconds
 * since the previous call as the parameter.
 */
 export default class Animator {
  /**
   * A possible parameter to setLoopCount.
   */
  static INFINITE = -1;

  /**
   * RepeatBehavior determines what animator does after reaching the end of the loop.
   * If it is set to LOOP, then the next loop will start from 0 again,
   * proceeding to 1. If the behavior is REVERSE the odd loops will run
   * backwards - from 1 to 0. Obviously setting this parameter only makes sense when the
   * number of loops is more than 1.
   */
  static REPEAT_BEHAVIOR = {
    LOOP: 1,
    REVERSE: 2
  };

  #duration;
  #repeatCount;
  #acceleration;
  #deceleration;
  #loopsDone;
  #repeatBehavior;
  #timeSinceLoopStart;
  #started;
  #running;
  #reverseLoop;

  constructor(duration) {
    this.#duration = duration;

    // total loops to do
    this.#repeatCount = 1;

    // the fraction to accelerate
    this.#acceleration = 0;

    // the fraction to decelerate
    this.#deceleration = 0;

    // How many loops were actually done
    this.#loopsDone = 0;

    // Default repeat behavior is LOOP
    this.#repeatBehavior = Animator.REPEAT_BEHAVIOR.LOOP;

    // Time, passed since the start of the loop
    this.#timeSinceLoopStart = 0;

    // This flag is used to indicate that the animator has already
    // started to work
    this.#started = false;
    this.#running = false;

    // Flag to mark that the loop is going into the opposite direction
    this.#reverseLoop = false;
  }

  /**
   * Starts the animator. After the animator is started you can't
   * change its parameters until stop() is called.
   */
   start() {
    this.#started = true;
    this.#running = true;
  }

  /**
   * Checks if animator is currently running
   */
  isRunning() {
    return this.#running;
  }

  /**
   * Stops the animator and resets the internal state. This function
   * may be called multiple times.
   */
  stop() {
    this.#loopsDone = 0;
    this.#timeSinceLoopStart = 0;
    this.#running = false;
    this.#started = false;
  }

  /**
   * Pauses the animator. The animator will ignore the updates while paused, "freezing"
   * the animation but not resetting its state. The animation can be then resumed
   */
  pause() {
    this.#running = false;
  }

  /**
   * This function should be called by the external timer to update the state
   * of the animator.
   * @param deltaTime - time passed since the last upate. 0 is valid value.
   */
  update(deltaTime) {
    // Will return undefined
    if (!this.#started) {
      return;
    }

    // If the animator is paused we pass 0 as deltaTime - like nothing has changed
    if (!this.#running) {
      deltaTime = 0;
    }

    this.#timeSinceLoopStart += deltaTime;

    // If we exceeded the loop time, we must take care of what to do next:
    // adjust the direction of the animation, call hook functions etc.
    if (this.#timeSinceLoopStart >= this.#duration) {
      

      // Just in case, we skipped more than one loop, determine how many loops did we miss
      let loopsSkipped = Math.floor(this.#timeSinceLoopStart/this.#duration);
      this.#timeSinceLoopStart %= this.#duration;

      // Truncate to the number of loops skipped. Even if we skipped 5 loops,
      // but there was only 3 left, we don't want to fire extra listeners.
      if (this.#repeatCount != Animator.INFINITE && loopsSkipped > this.#repeatCount - this.#loopsDone) {
        loopsSkipped = this.#repeatCount - this.#loopsDone;
      }

      // Call the hook for each of the skipped loops
      for (let i = 1; i <= loopsSkipped; i++) {
        this.#loopsDone++;
        this.#reverseLoop = this.#repeatBehavior == Animator.REPEAT_BEHAVIOR.REVERSE && this.#loopsDone % 2 == 1;
        this.#onLoopEnd(this.#loopsDone);
      }

      // Check if we reached the end of the animation
      if (this.#repeatCount != Animator.INFINITE && this.#loopsDone == this.#repeatCount) {
        this.#onAnimationEnd();
        this.stop();
        return;
      }
    }

    let fraction = this.#timeSinceLoopStart/this.#duration;

    // If this is the loop that is going backwards - reverse the fraction as well
    if (this.#reverseLoop) {
      fraction = 1 - fraction;
    }

    // Give away for preprocessing (acceleration/deceleration, easing functions etc)
    fraction = this._timingEventPreprocessor(fraction);

    // Call update
    this._onUpdate(fraction, this.#loopsDone);
    return fraction;
  }

  /**
   * Returns the duration of one loop of the animation
   */
  getDuration() {
    return this.#duration;
  }

  /**
   * Sets the duration of one loop of the animation. Should be value >=1
   */
  setDuration(duration) {
    this._throwIfStarted();
    if (duration < 1) {
      throw "Duration can't be < 1";
    }
    this.#duration = duration;
  }

  /**
   * Returns the configured repeat count, default is 1.
   */
  getRepeatCount() {
    return this.#repeatCount;
  }

  /**
   * Set the number of loops in the animation, default is 1. Valid values
   * are integers, -1 or Animator.INFINITE for infinite looping
   */
  setRepeatCount(repeatCount) {
    this._throwIfStarted();
    if (repeatCount < 1 && repeatCount != Animator.INFINITE) {
      throw "Repeat count must be greater than 0 or INFINITE";
    }
    this.#repeatCount = repeatCount;
  }

  /**
   * Returns the configured repeat behavior of the animator. Possible values are
   * Animator.REPEAT_BEHAVIOR.LOOP and Animator.REPEAT_BEHAVIOR.REVERSE. Read the docs for
   * Animator.REPEAT_BEHAVIOR for the details on how they differ.
   */
  getRepeatBehavior() {
    return this.#repeatBehavior;
  }

  /**
   * Sets the repeat behavior, default value is Animator.REPEAT_BEHAVIOR.LOOP
   * @param behavior the new repat behavior
   */
  setRepeatBehavior(behavior) {
    this._throwIfStarted();
    if (behavior != Animator.REPEAT_BEHAVIOR.LOOP && behavior != Animator.REPEAT_BEHAVIOR.REVERSE) {
      throw "Repeat behavior should be either REPEAT_BEHAVIOR.LOOP or REPEAT_BEHAVIOR.REVERSE";
    }
    this.#repeatBehavior = behavior;
  }

  /**
   * Returns the current value for the acceleration, default is 0.
   */
  getAcceleration() {
    return this.#acceleration;
  }

  /**
   * Sets the value for the acceleration. The value must be between 0 and 1-deceleration.
   * @param acceleration new acceleration
   */
  setAcceleration(acceleration) {
    this._throwIfStarted();
    if (acceleration < 0 || acceleration > 1 || acceleration > (1 - this.#deceleration)) {
      throw "Acceleration value must be from 0 to 1 and cannot be greater than (1 - deceleration)";
    }
    this.#acceleration = acceleration;
  }

  /**
   * Returns the current value for the deceleration, default is 0.
   */
  getDeceleration() {
    return this.#deceleration;
  }

  /**
   * Sets the value for the deceleration. The value must be between 0 and 1-acceleration.
   * @param deceleration new deceleration
   */
  setDeceleration(deceleration) {
    this._throwIfStarted();
    if (deceleration < 0 || deceleration > 1 || deceleration > (1 - this.#acceleration)) {
      throw "Deceleration value must be from 0 to 1 and cannot be greater than (1 - acceleration)";
    }
    this.#deceleration = deceleration;
  }

  /**
   * In the default implementation the preprocessor takes into the account
   * only acceleration and deceleration. In more advanced implementation it might
   * use easing functions or any other more advanced transformations.
   */
  _timingEventPreprocessor(fraction) {
    return this.#accelerationDecelerationPreprocessor(fraction);
  }

  /**
   * Calculates the fraction with the respect to the acceleration and deceleration values.
   * See the SMIL 2.0 specification for details on this calculation. You shouldn't really dive deep
   * into the details of this particular piece of code, if you're not very curious.
   */
  #accelerationDecelerationPreprocessor(fraction) {
    if (this.#acceleration || this.#deceleration) {
      const runRate = 1/(1 - this.#acceleration/2 - this.#deceleration/2);
      if (fraction < this.#acceleration) {
        fraction *= runRate * (fraction / this.#acceleration) / 2;
      } else if (fraction > (1 - this.#deceleration)) {
        // time spent in deceleration portion
        const tdec = fraction - (1 - this.#deceleration);
        // proportion of tdec to total deceleration time
        const pdec  = tdec / this.#deceleration;
        fraction = runRate * (1 - (this.#acceleration / 2) -
          this.#deceleration + tdec * (2 - pdec) / 2);
      } else {
        fraction = runRate * (fraction - (this.#acceleration / 2));
      }
      // clamp fraction to [0,1] since above calculations may
      // cause rounding errors
      if (fraction < 0) {
        fraction = 0;
      } else if (fraction > 1) {
        fraction = 1;
      }
    }
    return fraction;
  }

  /**
   * This function is called to ensure that the animator is not running
   * (changing the setting of the running animator is not allowed)
   */
  _throwIfStarted() {
    if (this.#started)
      throw "Cannot change property on the started animator";
  }

  /**
   * Hook function. Override in subclass to provide the specific
   * implementation of the updates. For example, you may change the
   * active frame, adjust the coordinates or color of the object.
   *
   * @param fraction the current fraction of the animation: from 0 to 1
   * @param loopsDone how many loops done already.
   */
  _onUpdate(fraction, loopsDone) {
  }

  /**
   * Hook function - called when the loop ends. Should be owerwritten in
   * subclasses if you need any extra functionality here.
   * @param loopsDone the number of loops done from the start of the animation,
   * the latest loop is included.
   */
  #onLoopEnd(loopsDone) {
  }

  /**
   * Hook function - called when the animation ends to be owerwritten in
   * subclasses if you need any extra functionality here.
   */
  #onAnimationEnd() {
  }

}