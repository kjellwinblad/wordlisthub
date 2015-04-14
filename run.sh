#!/bin/sh

mongod --smallfiles --dbpath --port 27018  ../../data &

sleep 5

npm start
