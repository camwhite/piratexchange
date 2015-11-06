import {Socket} from 'services/socket';

export class WebRTC {
  constructor(socket: Socket) {
    this.socket = socket;
    this.currentUserId = this.socket.socket.id;

    this.servers = {'iceServers': [
      {'url': 'stun:stun.ekiga.net'}
    ]};

    this.peerConnections = {};
    this.file = {};
    this.receiveBuffer = [];
    this.receivedSize = 0;
    this.percentLoaded = 0;
  }
  init(params, elem) {
    this.params = params.id;
    this.room = this.params;

    let firstId = this.params.split('').splice(0, 20).join('');
    let secondId = this.params.split('').splice(20, 20).join('');

    if(this.currentUserId != firstId) {
      this.matchId = firstId;
    }
    else {
      this.matchId = secondId;
    }

    this.input = elem.children[0];
    this.sendProgress = elem.children[1];
    this.receiveProgress = elem.children[2];
    this.download = elem.children[3];
    this.linkEl = document.createElement('a');

    this.input.addEventListener('change', () => {
      if(this.caller != undefined) {
        this.sendData();
      }
      else {
        this.makeOffer();
      }
    }, false);
  }
  getPeerConnection(id) {
    if(this.peerConnections[id]) {
      return this.peerConnections[id];
    }

    let pc = new RTCPeerConnection(this.servers);
    this.peerConnections[id] = pc;

    pc.onicecandidate = (evt) => {
      if(evt.candidate != null) {
        this.socket.emit('msg', {room: this.room, by: this.currentUserId, to: id, ice: evt.candidate, type: 'ice'});
      }
    }

    pc.ondatachannel = (evt) => {
      this.receiveChannel = evt.channel;
      this.receiveChannel.binaryType = 'arraybuffer';

      this.receiveChannel.onmessage = (evt) => {
        this.receiveBuffer.push(evt.data);
        this.receivedSize += evt.data.byteLength;

        this.receiveProgress.value = this.receivedSize;

        if (this.receivedSize == this.file.size) {
          pc.getStats(null, (stats) => console.log(stats));

          let received = new Blob(this.receiveBuffer);

          this.receivedSize = 0;
          this.receiveBuffer = [];

          var link = this.linkEl.cloneNode();
          link.href = URL.createObjectURL(received);
          link.download = this.file.name;

          let text =`<p>Save yer treasure ${this.file.name} - ${this.file.formattedSize}</p>`;
          link.innerHTML = text;

          this.download.appendChild(link);
        }
      };
    }

    this.sendChannel = pc.createDataChannel('Send Channel', {ordered: false, reliable: false});
    this.sendChannel.binaryType = 'arraybuffer';

    this.sendChannel.onopen = (evt) => {
      console.log('send', evt);
      if (this.sendChannel.readyState === 'open') {
        this.sendData();
      }
    };

    this.sendChannel.onclose = () => {
      console.log('channel closed');
      this.receiveChannel.close();
      this.peerConnections = {};
      pc.close();
      pc = null;
    };

    return pc;
  }
  makeOffer() {
    let id = this.matchId;
    let pc = this.getPeerConnection(id);

    pc.createOffer(sdp => {
      pc.setLocalDescription(sdp, () => {
        this.socket.emit('msg', {room: this.room, by: this.currentUserId, to: id,  type: 'sdp-offer', sdp: sdp})
      });
    }, (err) => console.log(err));
  }
  handleCall(call) {
    var pc = this.getPeerConnection(call.by);
    switch(call.type) {
      case 'sdp-offer':
        pc.setRemoteDescription(new RTCSessionDescription(call.sdp), () => {
          console.log('Setting remote description by offer');
          this.caller = true;
          pc.createAnswer(sdp => {
            pc.setLocalDescription(sdp);
            this.socket.emit('msg', {room: this.room, by: call.to, to: call.by, sdp: sdp, type: 'sdp-answer'});
          }, (err) => console.log(err));
        }, (err) => console.log(err));
        break;
      case 'sdp-answer':
        pc.setRemoteDescription(new RTCSessionDescription(call.sdp), () => {
          console.log('Setting remote description by answer');
          this.caller = false;
        }, (err) => console.error(err));
        break;
      case 'ice':
        if (call.ice) {
          console.log('Adding ice candidates');
          pc.addIceCandidate(new RTCIceCandidate(call.ice));
        }
        break;
    }
  }
  sendData() {
    let file = this.input.files[0];
    if(file == undefined) {
      return;
    }

    this.sendProgress.max = file.size;

    let formatBytes = (bytes, decimals) => {
      var k = 1000;
      var dm = decimals + 1 || 3;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
    }

    let formattedBytes = formatBytes(file.size, 3);
    this.socket.emit('sending:data', {name: file.name, size: file.size, formattedSize: formattedBytes,  room: this.room});

    const chunkSize = 16384;
    const bufferMax = 16596992;
    let sliceFile = (offset) => {
      let reader = new FileReader();
      reader.onload = ((e) => {
        console.log(this.sendChannel.bufferedAmount);
        let bufferCheck = this.sendChannel.bufferedAmount > bufferMax;
        this.sendChannel.send(e.target.result);

        if (file.size > offset + e.target.result.byteLength && bufferCheck) {
          console.log('overflow');
          setTimeout(sliceFile, 250, offset + chunkSize);
        }
        else if (file.size > offset + e.target.result.byteLength) {
          setTimeout(sliceFile, 0, offset + chunkSize);
        }

        this.sendProgress.value = offset + e.target.result.byteLength;
      });
      let slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };

    sliceFile(0);
  }
}
