from flask import (Flask,jsonify,Response,send_from_directory,request)
from werkzeug.utils import secure_filename
import json
import subprocess
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
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


#select sheet music (e.g. http://localhost:5000/api/music/select?music_id=1)
@app.route('/api/music/select', methods=['GET'])
def select_music_api():
    params = request.args.to_dict()

    #MUST change the params else will not work
    # params['music_id'] = "1"
    if params['music_id']:
        with open(f'./data_reference/abcjs_files/{params["music_id"]}.abc') as f:
            abc_payload = f.read().strip()
        response = jsonify({"data": abc_payload})
        response.status = 200
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

#get recorded audio
@app.route('/api/record_audio', methods=['GET', 'POST', 'OPTIONS'])
def get_score():
    if request.method == 'OPTIONS':
        # https://stackoverflow.com/a/71362294
        response = jsonify({})
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '300',
        }
        return response

    start_time = time.time()
    if request.method == 'POST':
        music_id = request.form.get('music_id', None)
        if music_id is not None:
            print("music_id", music_id)
            #note the input must be in m4a
            f = request.files['file']
            file_path_webm = "./data_query/audio_files/"+'query.webm'
            f.save(file_path_webm)
            file_path = "./data_query/audio_files/"+'query.m4a'
            subprocess.call(['ffmpeg', '-loglevel', 'warning', '-hide_banner', '-nostats', '-y', '-i', file_path_webm, '-vn', file_path])

            #params
            ref_filename = music_id
            query_filename = 'query'

            #run the evaluation model
            notes_hit, notes_miss, notes_total, notes_hit_sequence = get_evaluation(ref_filename,query_filename)
            #time in seconds
            duration = time.time() - start_time
            response = jsonify({'data': {
                'notes_hit':notes_hit,
                'notes_miss':notes_miss,
                'notes_total':notes_total,
                'time_taken':duration,
                'notes_hit_sequence':notes_hit_sequence
            }})
            response.status = 200
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
    