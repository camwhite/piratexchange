export class WebRTC {
  constructor() {
    this.servers = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]};
    this.receiveBuffer = [];
    this.receiveSize = 0;

    this.createConnection = this.createConnection.bind(this);
    this.onReceiveMessageCallback = this.onReceiveMessageCallback.bind(this);
    this.onReceiveChannelStateChange = this.onReceiveChannelStateChange.bind(this);
  }
  init(elem) {
    this.input = elem
    this.input.addEventListener('change', this.createConnection.bind(this), false);
  }
  createConnection() {
    this.localConnection = new RTCPeerConnection(this.servers);

    this.sendChannel = this.localConnection.createDataChannel('Send Channel');
    this.sendChannel.binaryType = 'arraybuffer';

    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);
    this.localConnection.onicecandidate = this.iceCallbackOne.bind(this);

    this.localConnection.createOffer(descOne => {
      this.localConnection.setLocalDescription(descOne);
      this.remoteConnection.setRemoteDescription(descOne);

      this.remoteConnection.createAnswer(descTwo => {
        this.remoteConnection.setLocalDescription(descTwo);
        this.localConnection.setRemoteDescription(descTwo);

      }, this.onCreateSessionDescriptionError);
    }, this.onCreateSessionDescriptionError);

    this.remoteConnection = new RTCPeerConnection(this.servers);
    this.remoteConnection.onicecandidate = this.iceCallbackTwo.bind(this);
    this.remoteConnection.ondatachannel = this.receiveChannelCallback.bind(this);
  }
  onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error.toString());
  }
  sendData() {
    var file = this.input.files[0];
    console.log(file);
    if (file.size === 0) {
      return;
    }
    var chunkSize = 16384;
    var sliceFile = (offset) => {
      var reader = new FileReader();
      reader.onload = (() => {
        return (e) => {
          this.sendChannel.send(e.target.result);
          if (file.size > offset + e.target.result.byteLength) {
            setTimeout(sliceFile, 0, offset + chunkSize);
          }
        };
      })(file);
      var slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    sliceFile(0);
  }
  closeDataChannels() {
    this.sendChannel.close();
    this.receiveChannel.close();
    this.localConnection.close();
    this.remoteConnection.close();
    this.localConnection = null;
    this.remoteConnection = null;
  }
  iceCallbackOne(event) {
    if (event.candidate) {
      this.remoteConnection.addIceCandidate(event.candidate, this.onAddIceCandidateSuccess.bind(this), this.onAddIceCandidateError.bind(this));
    }
  }
  iceCallbackTwo(event) {
    if (event.candidate) {
      this.localConnection.addIceCandidate(event.candidate, this.onAddIceCandidateSuccess.bind(this), this.onAddIceCandidateError.bind(this));
    }
  }
  onAddIceCandidateSuccess() {
    console.log('ice callback succeeded');
  }
  receiveChannelCallback(event) {
    this.receiveChannel = event.channel;
    this.receiveChannel.binaryType = 'arraybuffer';
    this.receiveChannel.onmessage = this.onReceiveMessageCallback;
    this.receiveChannel.onopen = this.onReceiveChannelStateChange;
    this.receiveChannel.onclose = this.onReceiveChannelStateChange;

    this.receivedSize = 0;
  }
  onReceiveMessageCallback(event) {
    this.receiveBuffer.push(event.data);
    this.receivedSize += event.data.byteLength;
  }
  onSendChannelStateChange() {
    if (this.sendChannel.readyState === 'open') {
      this.sendData();
    }
  }
  onReceiveChannelStateChange() {
    if (this.receiveChannel.readyState === 'open') {
      console.log(this.receiveChannel);
    }
  }
}

