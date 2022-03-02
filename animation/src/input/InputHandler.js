import MouseInputHandler from "./MouseInputHandler";
import TouchInputHandler from "./TouchInputHandler";
import { isTouchDevice } from '../util';

const InputHandler = isTouchDevice() ? TouchInputHandler : MouseInputHandler;

export default InputHandler;