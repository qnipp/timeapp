#!/bin/sh

export MONGO_URL=mongodb://localhost:27017/timeapp
export MONGO_OPLOG_URL=mongodb://localhost:27017/local
meteor
