REM host goldburger.qnipp.com
REM         ServerAliveInterval 5
REM         Port 40223
REM         LocalForward 27017 127.0.0.1:27017
REM         ForwardAgent yes

# ssh -L 27017:localhost:27017 goldburger.qnipp.com

set MONGO_URL=mongodb://localhost:27017/timeapp_qnipp_com
set MONGO_OPLOG_URL=mongodb://localhost:27017/local
meteor
