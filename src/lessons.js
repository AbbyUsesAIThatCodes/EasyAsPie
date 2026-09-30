export const LESSONS=Object.freeze([
 {title:'Same Serving, More Pieces',from:{n:1,d:2},to:8,action:'cut',prediction:2,prompt:'Predict the numerator after each half is cut in two.',explanation:'1/2 = 2/4: both numbers doubled. The selected amount stayed fixed.'},
 {title:'Same Serving, Fewer Pieces',from:{n:12,d:16},to:4,action:'regroup',prediction:6,prompt:'Predict the numerator after adjacent sixteenths regroup in pairs.',explanation:'12/16 = 6/8: both numbers halved. The serving did not shrink.'},
 {title:'From Pie To Bar',from:{n:3,d:8},to:16,action:'cut',prediction:6,prompt:'Predict how many sixteenths match three eighths.',explanation:'3/8 = 6/16: each eighth becomes two sixteenths, in the pie and its bar.'}
]);
