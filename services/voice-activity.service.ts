class VoiceActivityService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  async initialize(stream: MediaStream) {
    if (stream.getAudioTracks().length === 0) {
      console.warn("VoiceActivityService: MediaStream has no audio tracks.");
      return;
    }
    this.audioContext = new AudioContext();

    const source =
      this.audioContext.createMediaStreamSource(
        stream
      );

    this.analyser =
      this.audioContext.createAnalyser();

    this.analyser.fftSize = 512;

    source.connect(this.analyser);

    this.dataArray =
      new Uint8Array(
        this.analyser.frequencyBinCount
      );
  }

  getVolume() {
    if (
      !this.analyser ||
      !this.dataArray
    )
      return 0;

    this.analyser.getByteFrequencyData(
      this.dataArray
    );

    let sum = 0;

    for (const value of this.dataArray) {
      sum += value;
    }

    return sum / this.dataArray.length;
  }

  isSpeaking(threshold = 20) {
    return this.getVolume() > threshold;
  }
}

export default new VoiceActivityService();