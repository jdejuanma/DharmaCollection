import {createHandler} from '../server/handler.mjs';
import {getRuntime} from '../server/runtime.mjs';
export default {fetch:createHandler(getRuntime)};
