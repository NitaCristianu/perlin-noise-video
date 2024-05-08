import {makeProject} from '@motion-canvas/core';

import basics from './scenes/basics?scene';
import func from './scenes/func?scene';
import func2 from './scenes/func2?scene';
// import v from '/v2.wav';
import { Code, LezerHighlighter } from '@motion-canvas/2d';
import {parser} from '@lezer/cpp';

Code.defaultHighlighter = new LezerHighlighter(parser);

export default makeProject({
  experimentalFeatures : true,
  scenes: [basics, func, func2],
  // audio : v
});
