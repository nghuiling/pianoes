import numpy as np
import matplotlib
import matplotlib.pyplot as plt

import librosa
import librosa.display

import mido
import muspy
import pypianoroll
from music21 import *

import os.path
import os
import subprocess

def create_abcjs_score(save_path, abcjs_save_path, mid_filename,title='Title',speed=140):

  '''
  save_path: path of midi file
  abcjs_save_path: path to save output midi file and abcjs files
  mid_filename: filename of midi file
  title: name of sheet music
  speed: speed of sheet music
  ** note: assume that C major and 4/4 and quarter note only
  '''


  def save_abc_score_midi(content, file_name, save_path):

    #save abcjs
    abc_file_name = file_name + '.abc'
    complete_abc_path = os.path.join(save_path,abc_file_name) 

    with open(complete_abc_path, 'w') as outfile:
        outfile.write(content)

    #save midi file
    midi_file_name = file_name + '.mid'
    complete_midi_path = os.path.join(save_path,midi_file_name)  
    converter.parse(complete_abc_path).write('midi', complete_midi_path)

    #show midi sheet music and sound and piano roll
    converter.parse(complete_abc_path).show()
    print()
    print('note that the speed played here is not accurate, refer to actual midi file for accurate speed:')
    print()
    converter.parse(complete_abc_path).show('midi')
    print()

    return complete_abc_path, complete_midi_path

  def get_note_representation(save_path,mid_filename):
    #compare midi information
    complete_midi_path = os.path.join(save_path,mid_filename)  
    mid1 = mido.MidiFile(complete_midi_path, clip=True)
    # mid1.tracks

    music1 = muspy.from_mido(mid1)
    # piano_roll1 = muspy.to_pianoroll_representation(music1)

    #note-based representation (time,pitch,duration,velocity)
    note_representation = muspy.to_note_representation(music1)

    return note_representation

  def get_pitch_octave(number):
    '''
    get abcjs pitch octave from midi notes
    note: 
    - 2: lower ,,
    - 3: low ,
    - 4: normal
    - 5: high '
    - 6: higher ''
    '''
    get_pitch = pitch.Pitch(number).name
    if get_pitch[-1] =='#':
      get_pitch = '^' + get_pitch[0]
    elif get_pitch[-1] =='-':
      get_pitch = '_' + get_pitch[0]

    get_octave = pitch.Pitch(number).octave
    if get_octave==6:
      abcjs_note = get_pitch + "''"
    elif get_octave==5:
      abcjs_note = get_pitch + "'"
    elif get_octave==4:
      abcjs_note = get_pitch
    elif get_octave==3:
      abcjs_note = get_pitch + ","
    elif get_octave==2:
      abcjs_note = get_pitch + ",,"

    return abcjs_note

  def check_time(note_representation):

    '''
    get the time info (e.g. {1: 1024, 2: 2048, 4: 4096})
    '''
    time_rep = {}
    old = note_representation[:,2]
    old = np.unique(old)

    for i in np.sort(old):
      time_rep[int(i/min(old))] = i

    return time_rep
###############################################################################################
  all = ''
  record = 0
  count = 0

  rep = get_note_representation(save_path,mid_filename)
  # print('rep',rep)


  timing = check_time(rep)
  time_check = timing[1]


  #RUN THROUGH THE NOTE REP
  for index,value in enumerate(rep):

    #ONLY FOR THE FIRST NOTE
    if index==0:
      #check if it belongs to a start chord (don't count here, only count once at the end of chord)
      if value[0]==rep[index+1][0]:
        all=all+'['+str(get_pitch_octave(value[1]))
      else:
        all=all+str(get_pitch_octave(value[1]))
        time_count = int(value[2]/time_check)
        if time_count>1:
          all=all+str(time_count)
        count=count+time_count

        if count>=4:
          all=all+'|'
          count=0

    #THE REST
    else:

      #if not the last note
      try:

        #check if it belongs to a end chord (only count once at the end of chord)
        if (value[0]==rep[index-1][0])&(value[0]!=rep[index+1][0]):
          all=all+str(get_pitch_octave(value[1]))+']'
          time_count = int(value[2]/time_check)
          if time_count>1:
            all=all+str(time_count)
          count=count+time_count

          if count>=4:
            all=all+'|'
            count=0

          #check for rest after the note
          if (value[0]+value[2]!=rep[index+1][0]):

            rest_time = int((rep[index+1][0]-value[0]-value[2])/time_check)
            all=all+' z'+str(rest_time)
            count=count+rest_time

            if count>=4:
              all=all+'|'
              count=0
    

        #check if it belongs to a start chord
        elif (value[0]!=rep[index-1][0])&(value[0]==rep[index+1][0]):
          all=all+'['+str(get_pitch_octave(value[1]))
    
        
        #check if it belongs to a chord, but not the start or end
        elif (value[0]==rep[index-1][0])&(value[0]==rep[index+1][0]):
          all=all+str(get_pitch_octave(value[1]))

        #all the other notes
        else:
          all=all+str(get_pitch_octave(value[1]))
          time_count = int(value[2]/time_check)
          if time_count>1:
            all=all+str(time_count)
          count=count+time_count

          if count>=4:
            all=all+'|'
            count=0

          #check for rest after the note
          if (value[0]+value[2]!=rep[index+1][0]):
            rest_time = int((rep[index+1][0]-value[0]-value[2])/time_check)
            all=all+' z'+str(rest_time)
            count=count+rest_time

            if count>=4:
              all=all+'|'
              count=0

      #if its the last note
      except Exception:

        #check if it belongs to a end chord 
        if (value[0]==rep[index-1][0]):
          all=all+str(get_pitch_octave(value[1]))+']'   

        else:
          all=all+str(get_pitch_octave(value[1]))
        time_count = int(value[2]/time_check)

        if time_count>1:
          all=all+str(time_count)
        count=count+time_count

        if count>=4:
          all=all+'|'
          count=0

        else:
          #add rest
          all=all+' z'+str(int(4-count))+'|'       

  meta_info = "\nX:1\nT: {}\nM: 4/4\nL: 1/4\nQ:1/4={}".format(title,speed)

  # print('all',all)
  abcjs_score = meta_info + '\n' + all + '\n'
  filename = mid_filename.replace('.mid','')

  abcjs_fn, _ = save_abc_score_midi(abcjs_score, filename+'_abcjs', abcjs_save_path)
  converter.parse(abcjs_fn).plot()

  return rep,abcjs_score