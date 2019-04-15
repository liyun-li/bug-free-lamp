FROM python:3.6-alpine
MAINTAINER Nobody <dont-contact-us@localhost>

RUN apk add alpine-sdk # libffi-dev
COPY ./requirements.txt /tmp/r.txt
RUN pip install -r /tmp/r.txt

RUN mkdir -p /app
WORKDIR /app
RUN echo DEVELOPMENT_MODE=yes > .env

VOLUME /app
