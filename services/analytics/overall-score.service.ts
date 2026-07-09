interface Scores{

technical:number;

communication:number;

behavior:number;

confidence:number;

integrity:number;

voice:number;

}

class OverallScoreService{

calculate(scores:Scores){

return Number(

(

scores.technical*0.40+

scores.communication*0.20+

scores.behavior*0.15+

scores.confidence*0.10+

scores.integrity*0.10+

scores.voice*0.05

).toFixed(2)

);

}

}

export default new OverallScoreService();