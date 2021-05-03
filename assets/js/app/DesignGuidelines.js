/**
 * @author Wenchong Lai
 */
var designGuideline_NorthOfSM={
    area:{
        total:function(lotArea){
            return 1500+0.4*lotArea;
        },
        secondFlrRatio:0.9
    },
    stbk:{
        front:function(){return 25},
        side:{
            breakpoint:[0,70],
            ratio:[0,0.3],
            constant:9
        },
        side1:function(lotWidth){
            return this.street(lotWidth);
        },
        side2:function(){return 6},
        street:function(lotWidth){
            var dist=0;
            for (var i=0;i<this.side.breakpoint.length;i++){
                if (i!=this.side.breakpoint.length-1){
                    if ((lotWidth>=this.side.breakpoint[i]) && (lotWidth<this.side.breakpoint[i+1])){
                        dist=(lotWidth-this.side.breakpoint[i])*this.side.ratio[i]+this.side.constant;
                        return (dist<this.side2())?this.side2():dist;
                    }
                }
                else {
                    if (lotWidth>=this.side.breakpoint[i]){
                        dist=(lotWidth-this.side.breakpoint[i])*this.side.ratio[i]+this.side.constant
                        return (dist<this.side2())?this.side2():dist;
                    }
                }
            }
            
        },
        rearRatio:.3,
        rearConst:-9,
        rear:function(lotDepth){
            return 0.3*lotDepth-9
        }
    },
    ofst:{
        front:{
            ratio:.4,
            distance:4
        },
        side:{
            ratio:0.4,
            distance:2
        }
    },
    height:{
        plate:24,
        parapet:30,
        slope:0.5
    }
}