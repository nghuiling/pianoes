import Vex from 'vexflow';
import React, { useLayoutEffect, useRef } from 'react';
import { Box } from '@mui/material';

const { Factory } = Vex.Flow;

const myStyle = {
  border: '2px blue solid',
  padding: 10,
  borderRadius: 10,
  display: 'inline-block',
};
export default function Score(props) {
  const div = useRef();

  useLayoutEffect(() => {
    const svgContainer = document.createElement('div');
    const width = div.offsetWidth;
    const notes = props.notes[0];
    const vf = new Factory({
      renderer: { elementId: svgContainer, width, height: 100 },
    });
    const score = vf.EasyScore();
    // first bar (with time signature and cleffs)
    const bar1 = score.voice(score.notes(notes));
    // const beams1 = VF.Beam.applyAndGetBeams(bar1); // autobeam a voice
    const system = vf.System();
    system
      .addStave({ voices: [bar1] })
      .addClef('treble')
      .addTimeSignature('4/4');

    // second bar
    // var bar2 = score.voice(score.notes(notes[1]));
    // var beams2 = VF.Beam.applyAndGetBeams(bar2);
    // var system2 = this.makeSystem(vf, width);
    // system2.addStave({voices: [bar2]});
    vf.draw();
    // beams1.forEach(beam => beam.setContext(vf.getContext()).draw());
    // beams2.forEach(beam => beam.setContext(vf.getContext()).draw());
    // this.refs.outer.appendChild(svgContainer);

    // const svgContainer = document.createElement('div');
    // const renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
    // renderer.resize(500, 500);
    // const context = renderer.getContext();
    // // Create a stave of width 400 at position 10, 40 on the canvas.
    // const stave = new Stave(10, 40, 400);

    // // Add a clef and time signature.
    // stave.addClef('treble').addTimeSignature('4/4');

    // // Create the notes
    // const notes = [
    //   // A quarter-note C.
    //   new StaveNote({ keys: ['c/4'], duration: 'q' }),

    //   // A quarter-note D.
    //   new StaveNote({ keys: ['d/4'], duration: 'q' }),

    //   // A quarter-note rest. Note that the key (b/4) specifies the vertical
    //   // position of the rest.
    //   new StaveNote({ keys: ['b/4'], duration: 'qr' }),

    //   // A C-Major chord.
    //   new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    // ];

    // // Create a voice in 4/4 and add above notes
    // const voice = new Voice({ num_beats: 4, beat_value: 4 });
    // voice.addTickables(notes);

    // new Formatter().joinVoices([voice]).format([voice], 400);

    // // Render voice
    // voice.draw(context, stave);

    // // Connect it to the rendering context and draw!
    // stave.setContext(context).draw();
    const divElement = div.current;
    divElement.appendChild(svgContainer);
    return () => divElement.removeChild(svgContainer);
  }, [props.notes]);

  return <Box ref={div} style={myStyle} sx={{ width: '100%', p: 0 }} />;
}
