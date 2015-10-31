import {Socket} from 'services/socket';

export class WebRTC {
  constructor(socket: Socket) {
    this.socket = socket;
    this.currentUserId = this.socket.socket.id;

    this.servers = {'iceServers': [
      {'url': 'stun:stun.l.google.com:19302'}
    ]};

    this.peerConnections = {};
    this.file = {};
    this.receiveBuffer = [];
    this.receivedSize = 0;
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
    this.link = document.createElement('a');

    this.input.addEventListener('change', () => {
      if(this.sendChannel != undefined) {
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
          let received = new Blob(this.receiveBuffer);

          this.receivedSize = 0;
          this.receiveBuffer = [];

          this.link = this.link.cloneNode();
          this.link.href = URL.createObjectURL(received);
          this.link.download = this.file.name;

          let text =`<p>Save yer treasure ${this.file.name} - ${this.file.formattedSize}</p>`;
          this.link.innerHTML = text;

          this.download.appendChild(this.link);
        }
      };

      this.receiveChannel.onopen = () => {
        if (this.receiveChannel.readyState === 'open') {
          console.log('receive', evt);
        }
      };
      this.receiveChannel.onclose = () => {
        if (this.receiveChannel.readyState === 'open') {
          console.log(this.receiveChannel);
        }
      };
    }

    this.sendChannel = pc.createDataChannel('Send Channel');
    this.sendChannel.binaryType = 'arraybuffer';

    this.sendChannel.onopen = (evt) => {
      console.log('send', evt);
      if (this.sendChannel.readyState === 'open') {
        this.sendData();
      }
    };

    this.sendChannel.onmessage = (evt) => {
      this.receiveBuffer.push(evt.data);
      this.receivedSize += evt.data.byteLength;

      this.receiveProgress.value = this.receivedSize;

      if(this.receivedSize == this.file.size) {
        let received = new Blob(this.receiveBuffer);

        this.receivedSize = 0;
        this.receiveBuffer = [];

        this.link = this.link.cloneNode();
        this.link.href = URL.createObjectURL(received);
        this.link.download = this.file.name;

        let text =`<p>Save yer treasure ${this.file.name} - ${this.file.formattedSize}</p>`;
        this.link.innerHTML = text;

        this.download.appendChild(this.link);
      }
    };

    this.sendChannel.onclose = () => {
      console.log('channel closed');
      this.receiveChannel.close();
      this.peerConnections = {};
      pc.close();
      pc = null;
      console.log(pc);
    };

    return pc;
  }
  makeOffer() {
    this.caller = true;

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
          pc.createAnswer(sdp => {
            pc.setLocalDescription(sdp);
            this.socket.emit('msg', {room: this.room, by: call.to, to: call.by, sdp: sdp, type: 'sdp-answer'});
          }, (err) => console.log(err));
        }, (err) => console.log(err));
        break;
      case 'sdp-answer':
        pc.setRemoteDescription(new RTCSessionDescription(call.sdp), () => {
          this.caller = false;
          console.log('Setting remote description by answer');
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
    let sliceFile = (offset) => {
      let reader = new FileReader();
      reader.onload = (() => {
        return (e) => {
          if(this.caller) {
            this.sendChannel.send(e.target.result);
          }
          else {
            this.receiveChannel.send(e.target.result);
          }

          if (file.size > offset + e.target.result.byteLength) {
            setTimeout(sliceFile, 0, offset + chunkSize);
          }
          this.sendProgress.value = offset + e.target.result.byteLength;
        };
      })(file);
      let slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
  }
}
