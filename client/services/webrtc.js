import {Socket} from 'services/socket'

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
    this.room = `hideout:${this.params}`;

    this.input = elem.children[0];
    this.progress = elem.children[1];
    this.download = elem.children[2];

    this.input.addEventListener('change', () => {
      if(this.sendChannel != undefined) {
        this.sendData();
      }
      else {
        console.log('boo')
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

        this.progress.value = this.receivedSize;

        if (this.receivedSize == this.file.size) {
          let received = new Blob(this.receiveBuffer);

          this.receivedSize = 0;
          this.receiveBuffer = [];

          this.download.href = URL.createObjectURL(received);
          this.download.download = this.file.name;
          let text = 'Click to download \'' + this.file.name + '\' (' + this.file.size +' bytes)';
          this.download.appendChild(document.createTextNode(text));
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

      this.progress.value = this.receivedSize;

      if (this.receivedSize == this.file.size) {
        let received = new Blob(this.receiveBuffer);

        this.receivedSize = 0;
        this.receiveBuffer = [];

        this.download.href = URL.createObjectURL(received);
        this.download.download = this.file.name;

        let text = `Download ${this.file.name} - ${this.file.size}(bytes)`;
        this.download.appendChild(document.createTextNode(text));
      }
    };

    this.sendChannel.onclose = () => {
      console.log('channel closed');
      this.receiveChannel.close();
      this.progress.value = 0;
      this.peerConnections = {};
      pc.close();
      pc = null;
      console.log(pc);
    };

    return pc;
  }
  makeOffer() {
    let id = this.params;
    let pc = this.getPeerConnection(id);
    pc.createOffer(sdp => {
      pc.setLocalDescription(sdp, () => {
        this.socket.emit('msg', {room: this.room, by: this.currentUserId, to: id,  type: 'sdp-offer', sdp: sdp})
      });
    }, (err) => console.log(err));
  }
  handleCall(call) {
    var pc = this.getPeerConnection(call.by);
    switch (call.type) {
      case 'sdp-offer':
        pc.setRemoteDescription(new RTCSessionDescription(call.sdp), () => {
          console.log('Setting remote description by offer');
          pc.createAnswer(sdp => {
            pc.setLocalDescription(sdp);
            this.socket.emit('msg', {room: this.room, by: this.currentUserId, to: call.by, sdp: sdp, type: 'sdp-answer'});
          }, (err) => console.log(err));
        }, (err) => console.log(err));
        break;
      case 'sdp-answer':
        pc.setRemoteDescription(new RTCSessionDescription(call.sdp), () => {
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
    let file = this.input.files[0]
    if (file == undefined) {
      return;
    }
    this.progress.max = file.size;
    this.socket.emit('sending:data', {name: file.name, size: file.size, room: this.room});

    const chunkSize = 16384;
    let sliceFile = (offset) => {
      let reader = new FileReader();
      reader.onload = (() => {
        return (e) => {
          if(this.currentUserId != this.params) {
            this.sendChannel.send(e.target.result);
          }
          else {
            this.receiveChannel.send(e.target.result);
          }

          if (file.size > offset + e.target.result.byteLength) {
            setTimeout(sliceFile, 0, offset + chunkSize);
          }
          this.progress.value = offset + e.target.result.byteLength;
        };
      })(file);
      let slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
  }
}
