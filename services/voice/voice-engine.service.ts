export interface VoiceState {
  transcript: string;

  words: number;

  wordsPerMinute: number;

  fillerCount: number;

  speakingTime: number;

  silenceTime: number;

  averageVolume: number;

  currentVolume: number;

  responseDelay: number;

  confidence: number;

  speaking: boolean;

  lastSpeechStarted: number | null;

  lastSpeechEnded: number | null;
}

class VoiceEngine {
  private state: VoiceState = {
    transcript: "",

    words: 0,

    wordsPerMinute: 0,

    fillerCount: 0,

    speakingTime: 0,

    silenceTime: 0,

    averageVolume: 0,

    currentVolume: 0,

    responseDelay: 0,

    confidence: 0,

    speaking: false,

    lastSpeechStarted: null,

    lastSpeechEnded: null,
  };

  private interviewStarted = Date.now();

  private questionFinishedAt: number | null = null;

  private totalVolume = 0;

  private volumeSamples = 0;

  updateTranscript(
    transcript: string,
    isFinal: boolean
  ) {
    this.state.transcript = transcript;

    if (!isFinal) return this.getState();

    const words =
      transcript
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    this.state.words += words.length;

    const elapsedMinutes =
      (Date.now() - this.interviewStarted) /
      60000;

    this.state.wordsPerMinute =
      elapsedMinutes > 0
        ? Number(
            (
              this.state.words /
              elapsedMinutes
            ).toFixed(1)
          )
        : 0;

    const fillers = [
      "um",
      "uh",
      "like",
      "actually",
      "basically",
      "you know",
      "kind of",
      "sort of",
      "i mean",
    ];

    const lower = transcript.toLowerCase();

    fillers.forEach((word) => {
      const regex = new RegExp(
        `\\b${word}\\b`,
        "g"
      );

      const matches =
        lower.match(regex);

      if (matches) {
        this.state.fillerCount +=
          matches.length;
      }
    });

    return this.getState();
  }

  updateSpeaking(
    speaking: boolean,
    volume: number
  ) {
    this.state.speaking = speaking;

    this.state.currentVolume = volume;

    this.totalVolume += volume;

    this.volumeSamples++;

    this.state.averageVolume =
      Number(
        (
          this.totalVolume /
          this.volumeSamples
        ).toFixed(2)
      );

    if (speaking) {
      this.state.speakingTime++;

      if (
        this.state.lastSpeechStarted ===
        null
      ) {
        this.state.lastSpeechStarted =
          Date.now();

        if (
          this.questionFinishedAt
        ) {
          this.state.responseDelay =
            Date.now() -
            this.questionFinishedAt;
        }
      }
    } else {
      this.state.silenceTime++;

      this.state.lastSpeechEnded =
        Date.now();

      this.state.lastSpeechStarted =
        null;
    }

    this.calculateConfidence();

    return this.getState();
  }

  questionFinished() {
    this.questionFinishedAt =
      Date.now();
  }

  private calculateConfidence() {
    let score = 100;

    if (
      this.state.wordsPerMinute < 80
    )
      score -= 20;

    if (
      this.state.wordsPerMinute >
      180
    )
      score -= 10;

    score -=
      this.state.fillerCount * 2;

    if (
      this.state.responseDelay >
      5000
    )
      score -= 15;

    this.state.confidence =
      Math.max(0, score);
  }

  getState() {
    return {
      ...this.state,
    };
  }
}

export default new VoiceEngine();