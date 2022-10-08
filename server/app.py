from flask import (Flask,jsonify,Response,send_from_directory,request)
import json
import os

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

    f = open('./midi_files/midi_files.json')
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

        f = open('./midi_files/midi_files.json')
        response = json.load(f)
        response = response['data'][int(params['music_id'])]
        response = jsonify(response)
        f.close()
        response.status = 200

        return response



if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
    