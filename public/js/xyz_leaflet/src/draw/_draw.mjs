import rectangle from './rectangle.mjs';

import circle from './circle.mjs';

import line from './line.mjs';

import point from './point.mjs';

import catchment from './catchment.mjs';

import isoline from './isoline.mjs';

import polygon from './polygon.mjs';

import finish from './finish.mjs';

export default _xyz => {

  _xyz.draw.rectangle = rectangle(_xyz);

  _xyz.draw.circle = circle(_xyz);

  _xyz.draw.line = line(_xyz);

  _xyz.draw.point = point(_xyz);

  _xyz.draw.polygon = polygon(_xyz);

  _xyz.draw.catchment = catchment(_xyz);

  _xyz.draw.isoline = isoline(_xyz);

  _xyz.draw.finish = finish(_xyz);

};