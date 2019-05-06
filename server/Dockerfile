FROM python:3.7-slim-stretch
MAINTAINER Nobody <dont-contact-us@localhost>

COPY ./requirements.txt /tmp/r.txt
RUN pip install -r /tmp/r.txt

RUN mkdir -p /app
WORKDIR /app
RUN echo DEVELOPMENT_MODE=yes > .env

VOLUME /app
