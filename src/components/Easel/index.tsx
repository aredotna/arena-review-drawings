import React, { useRef, useState } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { ReactComponent as Logo } from 'assets/arena-icon.svg';

import draw from './draw';
import { uploadFile } from 'lib/uploader';

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
  const [mode, setMode] = useState<'resting' | 'details' | 'saving' | 'saved'>(
    'resting'
  );
  const [thickness, setThickness] = useState<number>(10);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

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

    setMode('saving');

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
                title,
                description: `_Submitted by ${description}_`,
              },
            },
          }).then(() => {
            setMode('saved');
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
      <button
        id="save-button"
        onClick={() => setMode('details')}
        disabled={mode != 'resting'}
      >
        {
          {
            resting: 'Save',
            details: 'Save',
            saving: 'Saving...',
            saved: 'Saved!',
          }[mode]
        }
      </button>
      <button id="clear-button" onClick={clearCanvas}>
        Clear
      </button>
      <div id="info-panel">
        <Logo />
        <div>
          <h6>garden-for-the-book.are.na</h6>

          <h6>
            We (Are.na) are making a physical book and we'd like to grow a
            (figurative) community garden inside. Draw your favorite plant and
            we will add it to the book.
          </h6>

          <h6>
            See all submissions{' '}
            <a href="https://www.are.na/share/OyLDWOI" target="_blank">
              here
            </a>
            .
          </h6>
        </div>
      </div>
      <div id="thickness-settings">
        <div
          className={`thickness thickness-tiny ${thickness === 5 &&
            `selected`}`}
          onClick={() => setThickness(5)}
        />
        <div
          className={`thickness thickness-small ${thickness === 10 &&
            `selected`}`}
          onClick={() => setThickness(10)}
        />
        <div
          className={`thickness thickness-medium ${thickness === 25 &&
            `selected`}`}
          onClick={() => setThickness(25)}
        />
        <div
          className={`thickness thickness-large ${thickness === 40 &&
            `selected`}`}
          onClick={() => setThickness(40)}
        />
      </div>

      {mode === 'details' && (
        <div id="details">
          <div id="details-inner">
            <div>
              <h3>What is the name of your plant?</h3>
              <input
                type="text"
                placeholder="Name of plant"
                onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  setTitle(e.currentTarget.value)
                }
              />

              <h3>What is your name?</h3>
              <h6>(this is how you will be credited in the Are.na book)</h6>
              <input
                type="text"
                placeholder="Your name"
                onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  setDescription(e.currentTarget.value)
                }
              />
            </div>

            <button id="final-save-button" onClick={uploadAndSave}>
              Save plant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Easel;
