/**
 * @author Wenchong Lai
 */
var GeoLib=function(){
    this.content=[];
    this.append=function(which,className){
        if (which instanceof Surface){
            this.content[this.content.length]={shape:which,class:className}
        }
        else if (which instanceof PolySrf){
            for (var i=0;i<which.path.length;i++){
                this.content[this.content.length]={shape:which.path[i],class:className}
            }
        }
        else return;
    };
    this.clear=function(){
        this.content=[];
    };
    this.project=function(where,args){
        var x,y,z,alpha,theta,xNew,yNew;
        var xSum,ySum,zSum;
        var x1,y1,z1;
        x=args.x;y=args.y;z=args.z;
        alpha=args.alpha;theta=args.theta;
        xNew=args.xNew;yNew=args.yNew;zoom=args.zoom;
        xSum=0;ySum=0;zSum=0;
        x=isNaN(x)?xSum:x;
        y=isNaN(y)?ySum:y;
        z=isNaN(z)?zSum:z;
        alpha=isNaN(alpha)?0:(alpha%360+360)%360;
        theta=isNaN(theta)?0:(theta%360+360)%360;
        theta=(theta<=90)?theta:(theta>90 && theta<=180)?90:((theta>180 && theta<270)?-90:(theta-360));
        alpha*=Math.PI/180;
        theta*=Math.PI/180;
        xNew=isNaN(xNew)?0:xNew;
        yNew=isNaN(yNew)?0:yNew;
        zoom=isNaN(zoom)?1:zoom;
        var avr,min,max;
        var projYTemp;
        avr=[];min=[];max=[];
        projYTemp=[];
        for (var i=0;i<this.content.length;i++){
            avr[i]=[];
            temp=this.content[i].shape.toArray();
            min[i]=[Infinity,Infinity,Infinity];
            max[i]=[-Infinity,-Infinity,-Infinity];
            for (var j=0;j<temp.length;j++){
                for (var k=0;k<3;k++){
                    min[i][k]=(min[i][k]>Number(temp[j][k]))?Number(temp[j][k]):min[i][k];
                    max[i][k]=(max[i][k]<Number(temp[j][k]))?Number(temp[j][k]):max[i][k];
                }
            };
            for (var j=0;j<3;j++){
                avr[i][j]=(min[i][j]+max[i][j])/2;
            }
            key=this.content[i];
            avrTemp=avr[i];
            minTemp=min[i];
            maxTemp=max[i];
            t=i-1;
            while (t>=0){
                projYTemp[0]=-avr[t][0]*Math.sin(alpha)+avr[t][1]*Math.cos(alpha);
                projYTemp[1]=-avr[t+1][0]*Math.sin(alpha)+avr[t+1][1]*Math.cos(alpha);
                if (avr[t][2]==max[t][2]){
                    if (avr[t+1][2]>=max[t][2])
                        break;
                }
                if (avr[t+1][2]==max[t+1][2]){
                    if (avr[t+1][2]>=max[t][2])
                        break;
                };
                if (avr[t][2]!=max[t][2] && avr[t+1]!=max[t+1]){
                    if (min[t+1][2]>=max[t][2]) break;
                    if (projYTemp[1]>=projYTemp[0]) break;
                };
                //if ((avr[t+1][2]>=avr[t][2] && min[t+1][2]>min[t][2]) || (min[t+1][2]==min[t][2] && projYTemp[1]>=projYTemp[0])) break;
                this.content[t+1]=this.content[t];
                this.content[t]=key;
                avr[t+1]=avr[t];
                avr[t]=avrTemp;
                min[t+1]=min[t];min[t]=minTemp;
                max[t+1]=max[t];max[t]=maxTemp;
                t--;
            }
        };
        for (var i=0;i<this.content.length;i++){
            this.content[i].shape.project(where,args,getClassStyle(this.content[i].class))
        }
    };
}
