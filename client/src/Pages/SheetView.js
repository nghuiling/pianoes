import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Midi } from 'react-abc';
import { useParams } from 'react-router-dom';
import { get, postFile } from '../Adapters/base';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';

const zip = (a, b) =>
  Array.from(Array(Math.max(b.length, a.length)), (_, i) => [a[i], b[i]]);

export default function MusicSelect() {
  const [score, setScore] = useState(null);
  const [notation, setNotation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [webMediaRecorder, setWebMediaRecorder] = useState(null);
  const audioClips = useRef();
  const { id } = useParams();

  useEffect(() => {
    get('/api/music/select', { music_id: id })
      .then((data) => {
        setNotation(data);
        abcjs.renderAbc('paper', data, {
          scale: 1.8,
          responsive: 'resize',
          add_classes: true,
        });
      })
      .catch((err) => {
        console.log(`error loading selected sheet music: ${err}`);
      });
  }, [id, notation]);

  const initializeMedia = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true, // only audio needed for this app
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
            }
          };
          mediaRecorder.onstop = (e) => {
            const blob = new Blob(chunks, { type: 'audio/webm; codecs=vp9' });
            chunks.splice(0);
            setIsProcessing(true);
            postFile('/api/record_audio', blob, id).then((res) => {
              // TODO: handle the response and display results
              console.log(res);
              const numHit = res['notes_hit'];
              const numMiss = res['notes_miss'];
              // const numExtra = res['notes_extra'];
              const isCorrectArr = res['notes_hit_sequence'];
              const noteArr = document.getElementsByClassName('abcjs-note');
              zip(isCorrectArr, noteArr).forEach((pair) => {
                let [isCorrect, note] = pair;
                if (!isCorrect) {
                  note.setAttribute('fill', '#ff0000');
                }
              });
              setScore([numHit, numMiss]);
              setIsProcessing(false);
            });

            // TODO: REMOVE everything below once ready for production, this is only for sanity check (listen to audio)
            // const clipName = `clip-${audioClips.current.children.length}`;

            const clipContainer = document.createElement('article');
            // const clipLabel = document.createElement('p');
            const audio = document.createElement('audio');
            // const deleteButton = document.createElement('button');

            clipContainer.classList.add('clip');
            audio.setAttribute('controls', '');
            // deleteButton.innerHTML = 'Delete';
            // clipLabel.innerHTML = clipName;

            clipContainer.appendChild(audio);
            // clipContainer.appendChild(clipLabel);
            // clipContainer.appendChild(deleteButton);
            audioClips.current.appendChild(clipContainer);
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;

            // deleteButton.onclick = (e) => {
            //   let evtTgt = e.target;
            //   evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
            // };
            // END OF REMOVE
          };
        })
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
          alert('You need to enable microphone for this feature to work!');
        });
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  };

  useEffect(() => {
    initializeMedia();
    // eslint-disable-next-line
  }, []);

  const toggleRecord = (ev) => {
    if (webMediaRecorder) {
      isRecording ? webMediaRecorder.stop() : webMediaRecorder.start();
      setIsRecording(!isRecording);
    } else {
      initializeMedia();
    }
  };

  return (
    <Stack style={{ margin: 'auto', width: '100%' }} spacing={2}>
      <IconButton
        color='error'
        aria-label='record'
        onClick={toggleRecord}
        sx={{
          marginTop: '30px',
          mx: 'auto',
          width: '80px',
          height: '80px',
          backgroundColor: '#eeeeee',
          '&:hover': {
            backgroundColor: '#ffffff',
          },
        }}
      >
        {isRecording ? (
          <StopIcon />
        ) : (
          <KeyboardVoiceIcon disabled={isProcessing} />
        )}
      </IconButton>
      <div id='paper' style={{ width: '100%' }}></div>
      {/* <Notation notation={notation} /> */}
      {notation && <Midi notation={notation} />}
      {isProcessing && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
      {score && (
        <>
          <Typography variant='h6' sx={{ textAlign: 'center' }}>
            Notes Hit: {score[0]}
          </Typography>
          <Typography variant='h6' sx={{ textAlign: 'center' }}>
            Notes Missed: {score[1]}
          </Typography>
        </>
      )}
      <Stack spacing={0} ref={audioClips} sx={{ margin: 'auto' }}></Stack>
    </Stack>
  );
}
