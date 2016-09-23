var dgram = require('dgram');

var valvemaster = function(timeout) {
    timeout = timeout || 3000;

    client = dgram.createSocket('udp4');

    filter = '';
    region = 0xFF;
    cb = function() {};

    inQuery = false;
    socketLive = true;
    timer = null;
    ipArr = [];

    var vm = this;
    vm.US_EAST = 0x00;
    vm.US_WEST = 0x01;
    vm.SOUTCH_AMERICA = 0x02;
    vm.EUROPE = 0x03;
    vm.ASIA = 0x04;
    vm.AUSTRALIA = 0x05;
    vm.MIDDLE_EAST = 0x06;
    vm.AFRICA = 0x07;
    vm.WORLD = 0xFF;

    client.on('message', function(bytes, rinfo) {
        var buffer = new Buffer(bytes);
        if (buffer.length >= 6 && buffer.toString('hex', 0, 6) == 'ffffffff660a' && inQuery === true) {
            clearTimeout(timer);

            var seed;

            for (var i = 6; i < buffer.length; i += 6) {
                port = buffer.readUInt16BE(i + 4);
                ip = buffer.readUInt8(i) + '.' + buffer.readUInt8(i + 1) + '.' + buffer.readUInt8(i + 2) + '.' + buffer.readUInt8(i + 3);
                seed = ip + ':' + port;

                if (seed == '0.0.0.0:0') {
                    inQuery = false;
                    cb(null, ipArr);
                    return;
                }

                ipArr.push([seed, port]);
            }

            var next = new Buffer('1 ' + seed + '\0' + filter + '\0');
            next[1] = region;
            client.send(next, 0, next.length, rinfo.port, rinfo.address);
            timer = setTimeout(function() {
                inQuery = false;
                cb('Timeout', null);
            }, timeout);
        }
    });

    vm.query = function(pfilter, pregion, address, port, pcb) {
        if (inQuery === false && socketLive === true) {
            inQuery = true;

            filter = pfilter;
            region = pregion;
            cb = pcb;

            ipArr = [];
            buffer = new Buffer('1 0.0.0.0:0\0' + filter + '\0'),
                buffer[1] = region;

            client.send(buffer, 0, buffer.length, port, address);

            timer = setTimeout(function() {
                inQuery === false
                cb('Timeout', null);
            }, timeout);
        } else if (inQuery === true) {
            acb('You cannot do multiple queries at a time', null);
        } else {
            acb('Socket is closed', null);
        }
    }

    vm.close = function(cb) {
        cb = cb || function() {};
        if (inQuery === true) {
            cb('You cannot close the socket during query');
        } else if (socketLive === true) {
            socketLive = false;
            client.close();
        } else {
            cb('Socket is already closed');
        }
    }
}

module.exports = valvemaster;
