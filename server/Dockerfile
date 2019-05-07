FROM python:3.7-slim-stretch
MAINTAINER Nobody <dont-contact-us@localhost>

RUN apt update && apt upgrade -y
RUN apt install -y build-essential libpq-dev
COPY ./requirements.txt /tmp/r.txt
RUN pip install -r /tmp/r.txt

RUN mkdir -p /opt/bfl
WORKDIR /opt/bfl

