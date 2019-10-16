const draw = (
  ctx: CanvasRenderingContext2D,
  location: { x: number; y: number },
  last: { x: number; y: number },
  setLastCoords: (x: number, y: number) => void,
  thickness: number
) => {
  ctx.fillStyle = 'black';

  var x1 = location.x;
  var x2 = last.x;
  var y1 = location.y;
  var y2 = last.y;
  var x: number, y: number;

  var steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);

  if (steep) {
    x = x1;
    x1 = y1;
    y1 = x;
    y = y2;
    y2 = x2;
    x2 = y;
  }
  if (x1 > x2) {
    x = x1;
    x1 = x2;
    x2 = x;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  var dx = x2 - x1,
    dy = Math.abs(y2 - y1),
    error = 0,
    de = dy / dx,
    yStep = -1;
  y = y1;
  if (y1 < y2) {
    yStep = 1;
  }

  var lineThickness =
    thickness -
    Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / (thickness / 2);

  if (lineThickness < 1) {
    lineThickness = 1;
  }
  for (var x3 = x1; x3 < x2; x3++) {
    if (steep) {
      ctx.fillRect(y, x3, lineThickness, lineThickness);
    } else {
      ctx.fillRect(x3, y, lineThickness, lineThickness);
    }
    error += de;
    if (error >= 0.5) {
      y += yStep;
      error -= 1.0;
    }
  }

  setLastCoords(location.x, location.y);
};

export default draw;
