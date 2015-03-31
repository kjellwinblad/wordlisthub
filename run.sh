#!/bin/sh

mongod --smallfiles --dbpath  ../../data &

sleep 5

npm start
