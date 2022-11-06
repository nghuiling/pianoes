import React, { useEffect, useRef, useState } from 'react';
import { IconButton, Stack } from '@mui/material';
import { Notation, Midi } from 'react-abc';
import { useParams } from 'react-router-dom';
import { get, postFile } from '../Adapters/base';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';

export default function MusicSelect() {
  const [notation, setNotation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [webMediaRecorder, setWebMediaRecorder] = useState(null);
  const audioClips = useRef();
  const { id } = useParams();

  useEffect(() => {
    get('/api/music/select', { music_id: id })
      .then((data) => {
        setNotation(data);
      })
      .catch(console.log('error loading selected sheet music'));
  }, [id, notation]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.mediaDevices
        .getUserMedia({
          // constraints - only audio needed for this app
          audio: true,
        })
        .then((stream) => {
          // Success callback
          // const options = { mimeType: 'video/webm; codecs=vp9' };
          const chunks = [];
          const mediaRecorder = new MediaRecorder(stream);
          setWebMediaRecorder(mediaRecorder);
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
              console.log('recording', chunks.length);
            }
          };
          mediaRecorder.onstop = (e) => {
            console.log('recorder stopped');
            const blob = new Blob(chunks, { type: 'audio/webm; codecs=vp9' });
            chunks.splice(0);
            postFile('/api/record_audio', blob).then((res) => {
              // TODO: handle the response and display results
              console.log(res);
            });

            // TODO: REMOVE everything below once ready for production, this is only for sanity check (listen to audio)
            const clipName = `clip-${audioClips.current.children.length}`;

            const clipContainer = document.createElement('article');
            const clipLabel = document.createElement('p');
            const audio = document.createElement('audio');
            const deleteButton = document.createElement('button');

            clipContainer.classList.add('clip');
            audio.setAttribute('controls', '');
            deleteButton.innerHTML = 'Delete';
            clipLabel.innerHTML = clipName;

            clipContainer.appendChild(audio);
            clipContainer.appendChild(clipLabel);
            clipContainer.appendChild(deleteButton);
            audioClips.current.appendChild(clipContainer);
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;

            deleteButton.onclick = (e) => {
              let evtTgt = e.target;
              evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
            };
            // END OF REMOVE
          };
        })
        .catch((err) => {
          // Error callback
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  }, []);

  const toggleRecord = (ev) => {
    isRecording ? webMediaRecorder.stop() : webMediaRecorder.start();
    setIsRecording(!isRecording);
  };

  return (
    <Stack style={{ margin: 'auto' }} spacing={2}>
      <Notation notation={notation} />
      {notation && <Midi notation={notation} />}
      <IconButton color='error' aria-label='record' onClick={toggleRecord}>
        {isRecording ? <StopIcon /> : <KeyboardVoiceIcon />}
      </IconButton>
      <Stack spacing={0} ref={audioClips}></Stack>
    </Stack>
  );
}
