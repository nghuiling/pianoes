from flask import (Flask,jsonify,Response,send_from_directory,request)
from werkzeug.utils import secure_filename
import json
import os
from evaluation import *
from scipy.io.wavfile import read, write
import time


app = Flask(__name__)


#========== API handlers =====

#test api (e.g. http://localhost:5000/api)
@app.route('/api', methods=['GET'])
def test_api():

    return {
        "name": "huiling1",
        "test": "hello!"
    }


#view sheet music list (e.g. http://localhost:5000/api/music)
@app.route('/api/music', methods=['GET'])
def view_music_api():

    f = open('./data_reference/midi_files.json')
    response = json.load(f)
    response = jsonify(response)
    f.close()
    response.status = 200

    return response


#select sheet music (e.g. http://localhost:5000/api/music/select?music_id=1)
@app.route('/api/music/select', methods=['GET'])
def select_music_api():
    params = request.args.to_dict()

    #MUST change the params else will not work
    # params['music_id'] = "1"
    if params['music_id']:

        f = open('./data_reference/midi_files.json')
        response = json.load(f)
        response = response['data'][int(params['music_id'])]
        response = jsonify(response)
        f.close()
        response.status = 200

        return response

#get recorded audio
@app.route('/api/record_audio', methods=['GET', 'POST'])
def get_score():

    start_time = time.time()

    params = request.args.to_dict()

    if request.method == 'POST':

        if params['music_id']:
            
            #note the input must be in m4a
            f = request.files['query_audio_file']
            # file_name = secure_filename(f.filename)
            file_path = "./data_query/audio_files/"+'query.m4a'
            f.save(file_path)

            #params
            ref_filename = params['music_id']
            query_filename = 'query'

            #run the evaluation model
            notes_hit, notes_miss, notes_total = get_evaluation(ref_filename,query_filename)
            #time in seconds
            duration = time.time() - start_time
            response = jsonify({'notes_hit':notes_hit,'notes_miss':notes_miss,'notes_total':notes_total,'time_taken':duration})
            response.status = 200

            return response


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
    