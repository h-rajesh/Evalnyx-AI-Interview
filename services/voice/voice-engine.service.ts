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

    pauseCount: number;

  longestPause: number;

  currentPause: number;

  speechSegments: number;

  speakingRatio: number;

  energy: number;
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

      pauseCount: 0,

      longestPause: 0,

      currentPause: 0,

      speechSegments: 0,

      speakingRatio: 0,

      energy: 100,
    };

    private interviewStarted = Date.now();

    private questionFinishedAt: number | null = null;

    private totalVolume = 0;

    private volumeSamples = 0;

    reset() {
      this.state = {
        transcript: "",
        words: 0,
        wordsPerMinute: 0,
        fillerCount: 0,
        speakingTime: 0,
        silenceTime: 0,
        averageVolume: 0,
        currentVolume: 0,
        responseDelay: 0,
        confidence: 100,
        speaking: false,
        lastSpeechStarted: null,
        lastSpeechEnded: null,
        pauseCount: 0,
        longestPause: 0,
        currentPause: 0,
        speechSegments: 0,
        speakingRatio: 0,
        energy: 100,
      };
      this.interviewStarted = Date.now();
      this.questionFinishedAt = null;
      this.totalVolume = 0;
      this.volumeSamples = 0;
    }

    updateTranscript(
      transcript: string,
      isFinal: boolean
    ) {
      this.state.transcript = transcript;

      const currentWords = transcript
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

      // Total words is finalized words + current active segment words (if not final yet)
      const totalWords = this.state.words + (isFinal ? 0 : currentWords);

      if (isFinal) {
        this.state.words += currentWords;
      }

      const elapsedMinutes =
        (Date.now() - this.interviewStarted) /
        60000;

      this.state.wordsPerMinute =
        elapsedMinutes > 0
          ? Number(
              (
                totalWords /
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
      let currentSegmentFillers = 0;

      fillers.forEach((word) => {
        const regex = new RegExp(
          `\\b${word}\\b`,
          "g"
        );

        const matches = lower.match(regex);

        if (matches) {
          currentSegmentFillers += matches.length;
        }
      });

      if (isFinal) {
        this.state.fillerCount += currentSegmentFillers;
      }

      const activeFillerCount = this.state.fillerCount + (isFinal ? 0 : currentSegmentFillers);
      this.calculateConfidence(activeFillerCount);

      return this.getState();
    }

    updateSpeaking(
      speaking: boolean,
      volume: number
    ) {
      const wasSpeaking = this.state.speaking;
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
        if (!wasSpeaking) {
          this.state.speechSegments++;

          this.state.lastSpeechStarted = Date.now();

          if (this.questionFinishedAt) {
            this.state.responseDelay =
              Date.now() - this.questionFinishedAt;
          }
        }

        this.state.speakingTime++;

        this.state.currentPause = 0;
      } else {
        if (wasSpeaking) {
          this.state.pauseCount++;
        }

        this.state.silenceTime++;

        this.state.currentPause++;

        this.state.longestPause = Math.max(
          this.state.longestPause,
          this.state.currentPause
        );

        this.state.lastSpeechEnded = Date.now();
      }

      // Speaking Ratio
      const total =
        this.state.speakingTime +
        this.state.silenceTime;

      this.state.speakingRatio =
        total === 0
          ? 0
          : Math.round(
              (this.state.speakingTime / total) * 100
            );

      // Voice Energy
      this.state.energy = Math.round(
        Math.min(
          100,
          this.state.averageVolume * 100
        )
      );

      this.calculateConfidence();

      return this.getState();
    }

    questionFinished() {
      this.questionFinishedAt =
        Date.now();
    }

    private calculateConfidence(activeFillerCount?: number) {
      let score = 100;

      if (this.state.wordsPerMinute < 90)
        score -= 10;

      if (this.state.wordsPerMinute > 180)
        score -= 8;

      const currentFillers = activeFillerCount !== undefined ? activeFillerCount : this.state.fillerCount;
      score -= Math.min(
        currentFillers * 2,
        20
      );

      if (this.state.responseDelay > 5000)
        score -= 10;

      if (this.state.pauseCount > 8)
        score -= 8;

      if (this.state.longestPause > 5)
        score -= 8;

      if (this.state.averageVolume < 0.2)
        score -= 6;

      if (this.state.speakingRatio < 40)
        score -= 5;

      this.state.confidence = Math.max(
        0,
        Math.min(100, Math.round(score))
      );
    }

    getState() {
      return {
        ...this.state,
      };
    }
  }

  export default new VoiceEngine();