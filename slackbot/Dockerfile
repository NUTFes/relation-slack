FROM python:3.10

WORKDIR /work

RUN apt-get update -y && apt-get install -y vim

RUN pip install --upgrade pip

COPY requirements.txt /usr/local
RUN pip install -r /usr/local/requirements.txt

