import Vex from 'vexflow';
import React, { Component } from 'react';

const { Renderer, Stave, StaveNote, Voice, Formatter, EasyScore } = Vex.Flow;

export default class MyStave extends Component {
  constructor() {
    super();
    this.div = React.createRef();
  }
  componentDidMount() {
    const svgContainer = document.createElement('div');
    const renderer = new Renderer(svgContainer, Renderer.Backends.SVG);
    renderer.resize(500, 500);
    const context = renderer.getContext();
    // Create a stave of width 400 at position 10, 40 on the canvas.
    const stave = new Stave(10, 40, 400);

    // Add a clef and time signature.
    stave.addClef('treble').addTimeSignature('4/4');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();

    // Create the notes
    const notes = [
      // A quarter-note C.
      new StaveNote({ keys: ['c/4'], duration: 'q' }),

      // A quarter-note D.
      new StaveNote({ keys: ['d/4'], duration: 'q' }),

      // A quarter-note rest. Note that the key (b/4) specifies the vertical
      // position of the rest.
      new StaveNote({ keys: ['b/4'], duration: 'qr' }),

      // A C-Major chord.
      new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
    ];

    // Create a voice in 4/4 and add above notes
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(notes);

    // const score = new EasyScore();
    // console.log(this.props.notes[0]);
    // const voice = score.voice(score.notes(this.props.notes[0]));
    // console.log(voice);

    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices([voice]).format([voice], 400);

    // Render voice
    voice.draw(context, stave);
    console.log(this.div);
    this.div.current && this.div.current.appendChild(svgContainer);
  }

  render() {
    const myStyle = {
      border: '2px blue solid',
      padding: 10,
      borderRadius: 10,
      display: 'inline-block',
    };
    return <div ref={this.div} style={myStyle} />;
  }
}
