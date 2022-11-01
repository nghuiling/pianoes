FROM python:3.10.6-slim

WORKDIR /app

ENV FLASK_APP=app.py

ENV FLASK_ENV=development

COPY ./requirements.txt .

RUN apt-get -y update && apt-get install -y libsndfile1
RUN apt install -y fluidsynth
RUN pip install -r requirements.txt
RUN apt install -y ffmpeg
RUN apt-get install -y wget
RUN pip install piano_transcription_inference

COPY . .

EXPOSE 5000

CMD ["python","app.py"]