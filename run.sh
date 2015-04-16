#!/bin/sh

mongod --bind_ip 127.0.0.1 --smallfiles --port 27018 --dbpath ../../data &

sleep 5

npm start
