import React, { useRef, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { uploadFile } from 'lib/uploader';

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

const GET_POLICY = gql`
  {
    me {
      policy {
        key
        AWSAccessKeyId
        acl
        success_action_status
        policy
        signature
        bucket
      }
    }
  }
`;

const ADD_BLOCK = gql`
  mutation CreateBlock($input: CreateBlockInput!) {
    create_block(input: $input) {
      blokk {
        ... on Model {
          id
        }
      }
    }
  }
`;

const Easel: React.FC = () => {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const mouseDown = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [painting, setPainting] = useState(false);
  const [thickness, setThickness] = useState<number>(10);

  const setLastCoords = (x: number, y: number) => {
    mouseDown.current = { x, y };
  };

  const clearCanvas = () => {
    if (!canvasRef.current) {
      return null;
    }

    canvasRef.current.width = canvasRef.current.width;
  };

  const [addBlock] = useMutation(ADD_BLOCK);
  const { data, loading, error } = useQuery(GET_POLICY);

  if (loading || error) {
    return (
      <div id="canvas-container">
        <h1>Loading</h1>
      </div>
    );
  }

  const {
    me: { policy },
  } = data;

  const uploadAndSave = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!policy || !canvasRef.current) {
      return false;
    }

    canvasRef.current.toBlob(blob => {
      if (!blob) {
        return null;
      }
      uploadFile({
        blob,
        policy,
        onDone: url => {
          addBlock({
            variables: {
              input: {
                value: url,
                channel_ids: [process.env.REACT_APP_CHANNEL_SLUG],
              },
            },
          });
        },
      });
    });
  };

  return (
    <div id="canvas-container">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseUp={e => {
          setPainting(false);
        }}
        onMouseDown={e => {
          setPainting(true);
          mouseDown.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={e => {
          if (painting) {
            const canvas = canvasRef.current;
            const ctx = canvas && canvas.getContext('2d');

            if (!ctx) {
              return null;
            }

            draw(
              ctx,
              { x: e.clientX, y: e.clientY },
              mouseDown.current,
              setLastCoords,
              thickness
            );
          }
        }}
      />
      <button id="save-button" onClick={uploadAndSave}>
        Save
      </button>
      <button id="clear-button" onClick={clearCanvas}>
        Clear
      </button>
      <div id="thickness-settings">
        <div
          className="thickness thickness-small"
          onClick={() => setThickness(10)}
        />
        <div
          className="thickness thickness-medium"
          onClick={() => setThickness(25)}
        />
        <div
          className="thickness thickness-large"
          onClick={() => setThickness(40)}
        />
      </div>
    </div>
  );
};

export default Easel;
