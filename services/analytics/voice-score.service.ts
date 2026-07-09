class VoiceScoreService {

    calculate(snapshots:any[]) {

        if(!snapshots.length)
            return 0;

        let score = 100;

        snapshots.forEach(snapshot=>{

            if(snapshot.voiceVolume <0.15)
                score-=2;

            if(!snapshot.speaking)
                score-=1;

        });

        return Math.max(
            0,
            Number(
                (
                    score/
                    snapshots.length
                ).toFixed(2)
            )
        );

    }

}

export default new VoiceScoreService();