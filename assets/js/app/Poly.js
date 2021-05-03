/**
 * @author Wenchong Lai
 */
var innerAngle=function(dx0,dy0,dx1,dy1,type){
    
    if (typeof type !="string") type="DEG";
    r0=Math.sqrt(dx0*dx0+dy0*dy0);
    r1=Math.sqrt(dx1*dx1+dy1*dy1);
    
    var cos=Math.acos((dx0*dx1+dy0*dy1)/(r0*r1))*180/Math.PI;
    var asin=(-dx1*dy0+dx0*dy1)/(r0*r1);
    asin=(asin>1)?1:((asin<-1)?-1:asin)
    asin=Math.asin(asin);
    //console.log(asin)
    if (cos>90) asin=(asin>0)?(Math.PI-asin):(-Math.PI-asin);
    switch (type.toUpperCase()){
        case "RAD":return asin;
        default: return asin*(180/Math.PI);
    }
};
var trimNum=function(num,digit){
    if (isNaN(digit)) digit=-8;
    digit=Number(digit.toFixed(0));
    if (isNaN(num)) return false;
    num=Number(num);
    if (Math.abs(num-Number(num.toFixed(2)))<Math.pow(10,digit))
        {
            return Number(num.toFixed(-digit));
        }
       
    return num;
}
var Point=function(){
    this.path=new String();
    this.setPath=function(x,y){
        if (typeof x=="string" && !y){
            if (!isNaN(Number(x.split(",")[0])) && !isNaN(Number(x.split(",")[1]))){
                this.path=Number(x.split(",")[0])+","+Number(x.split(",")[1]);
            }
        }
        else if (x.length>=2 && !y){
            if (!isNaN(Number(x[0])) && !isNaN(Number(x[1]))) this.path=Number(x[0])+","+Number(x[1]);
        }
        else if (!isNaN(Number(x)) && !isNaN(Number(y))){
            this.path=Number(x)+","+Number(y);
        }
    };
    this.toArray=function(){
        return [Number(this.path.split(",")[0]),Number(this.path.split(",")[1])]
    };
    this.distanceTo=function(where,isInfinite){
        var x0,y0,x1,y1,x,y;
        var temp=this.toArray();
        var temp2=where.toArray();
        x=this.toArray()[0];y=this.toArray()[1];
        
        if (!(where instanceof Point) && !(where instanceof Segment) && !(where instanceof Poly)) return false;
        if (where instanceof Point){
            return Math.sqrt(Math.pow((x-temp2[0]),2)+Math.pow(y-temp2[1],2))
        }
        else if (where instanceof Segment){
            return where.distanceTo(this,isInfinite);
        }
        else {
            var dist=Infinity;
            var distTemp;
            var l=new Segment();
            for (var i=0;i<(where.closed?temp2.length:temp2.length-1);i++){
                l.setPath(temp2[i],temp2[(i+1)%temp2.length]);
                distTemp=this.distanceTo(l);
                dist=(dist>distTemp)?distTemp:dist;
            }
            return dist;
        }
    },
    this.positionTo=function(where){
        var droit;
        var temp=where.toArray();
        var a,b,c,x0,y0,x1,y1,x,y;
        var dist;
        x=this.toArray()[0];y=this.toArray()[1];
        if (where instanceof Poly){
            var l=new Segment();
            var l0=new Segment();
            var distMin=Infinity;
            var droit=-1;
            var minX=Infinity;
            var minY=Infinity;
            var maxX=-Infinity;
            var maxY=-Infinity;
            var pIntsct=0;
            for (var i=0;i<temp.length;i++){
                minX=(minX>temp[i][0])?temp[i][0]:minX;
                minY=(minY>temp[i][1])?temp[i][1]:minY;
                maxX=(maxX<temp[i][0])?temp[i][0]:maxX;
                maxY=(maxY<temp[i][1])?temp[i][1]:maxY;
            }
            if ((x>maxX || x<minX) || (y>maxY || y<minY)) return -1;
            l0.setPath(minX-1,y,x,y);
            for (var i=0;i<temp.length;i++){
                x0=temp[i][0];y0=temp[i][1];
                x1=temp[(i+1)%temp.length][0];y1=temp[(i+1)%temp.length][1];
                b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
                l.setPath(temp[i],temp[(i+1)%temp.length]);
                pIntscts=l0.intersect(l);
                
                if (pIntscts!=false) {
                    if (!pIntscts.length)
                        pIntscts=pIntscts.toArray();
                        if (pIntscts[0]!=temp[(i+1)%temp.length][0] || pIntscts[1]!=temp[(i+1)%temp.length][1]) droit*=-1;
                }
                dist=this.distanceTo(l);
                if (dist==0) return 0;
            }
            //console.log(distMin)
            return droit;
        };
        if (where instanceof Segment){
            x0=temp[0][0];y0=temp[0][1];
            x1=temp[1][0];y1=temp[1][1];
            b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
            return (b*y-a*x-c>0)?1:((b*y-a*x-c<0)?-1:0);
        };
        return false;
    }
}
var Segment=function(){
    var g=function(xParameter,yParameter,constant,xInput,yInput){
        return yParameter*yInput-xParameter*xInput-constant;
    };
    this.path=new String();
    this.setPath=function(x0,y0,x1,y1){
        if ((typeof x0 =="string") && !y0){
            this.path=x0;
        }
        else if (!x1){
            if ((x0 instanceof Point) && (y0 instanceof Point)){
                this.path=x0.path+" "+y0.path;
            }
            else if (x0.length>1 && y0.length>1){
                x0[0]=Number(x0[0]);x0[1]=Number(x0[1]);
                y0[0]=Number(y0[0]);y0[1]=Number(y0[1]);
                if (!(isNaN(x0[0])||isNaN(x0[1])||isNaN(y0[0])||isNaN(y0[1])))
                    this.path=x0[0]+","+x0[1]+" "+y0[0]+","+y0[1]
            }
        }
        else{
            x0=Number(x0);y0=Number(y0);x1=Number(x1);y1=Number(y1);
            if (!(isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1))){
                this.path=x0+","+y0+" "+x1+","+y1
            }
        }
    }
    this.toArray=function(){
        return [[Number(this.path.split(" ")[0].split(",")[0]),Number(this.path.split(" ")[0].split(",")[1])],[Number(this.path.split(" ")[1].split(",")[0]),Number(this.path.split(" ")[1].split(",")[1])]]
    }
    this.distanceTo=function(where,isInfinite){
        var dist=Infinity;
        var tempDist;
        var x0,y0,x1,y1,u0,v0,u1,v1,u,v;
        var temp=this.toArray();
        var a,b,c,d,e,f;
        var dx0,dy0,dx1,dy1,dx2,dy2;
        x0=temp[0][0];y0=temp[0][1];
        x1=temp[1][0];y1=temp[1][1];
        b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
        if (!(where instanceof Point) && !(where instanceof Segment)) return false;
        if (where instanceof Point){
            var temp2=where.toArray();
            u=temp2[0];v=temp2[1];
            dx0=x1-x0;dy0=y1-y0;
            dx1=u-x0;dy1=v-y0;
            dx2=u-x1;dy2=v-y1;
            if ((dx0*dx1+dy1*dy0)*(dx0*dx2+dy2*dy0)<0 || isInfinite){
                return Math.abs(g(a,b,c,u,v)/Math.sqrt(a*a+b*b))
            }
            else return Math.min(Math.sqrt(dx1*dx1+dy1*dy1),Math.sqrt(dx2*dx2+dy2*dy2))
        }//to be accomplished
        else if (where instanceof Segment){
            var temp2=where.toArray();
            var g1,g2,g3,g4;
            var p1,p2,p3,p4;
            u0=temp2[0][0];v0=temp2[0][1];
            u1=temp2[1][0];v1=temp2[1][1];
            e=u1-u0;d=v1-v0;f=u1*v0-v1*u0;
            
            g1=g(a,b,c,u0,v0);
            g2=g(a,b,c,u1,v1);
            g3=g(d,e,f,x0,y0);
            g4=g(d,e,f,x1,y1);
            if (g1*g2<0 && g3*g4<0){
                dist=0;return dist;
            }
            else {
                p1=new Point();
                p2=new Point();
                p3=new Point();
                p4=new Point();
                p1.setPath(x0,y0);
                p2.setPath(x1,y1);
                p3.setPath(u0,v0);
                p4.setPath(u1,v1);
                //console.log(Math.min(this.distanceTo(p3),this.distanceTo(p4),where.distanceTo(p1),where.distanceTo(p2)) )
                tempDist=Math.min(this.distanceTo(p3),this.distanceTo(p4),where.distanceTo(p1),where.distanceTo(p2));
                dist=(dist>tempDist)?tempDist:dist;
            }
            return dist;
        }
    },
    this.intersect=function(where){
        if (!(where instanceof Segment)) return false;
        if (this.distanceTo(where)>0) return false;
        var a,b,c,d,e,f;
        var x0,y0,x1,y1,u0,v0,u1,v1;
        var g1,g2,g3,g4;
        var temp,temp2;
        temp=this.toArray();temp2=where.toArray();
        x0=temp[0][0];y0=temp[0][1];x1=temp[1][0];y1=temp[1][1];
        u0=temp2[0][0];v0=temp2[0][1];u1=temp2[1][0];v1=temp2[1][1];
        b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
        e=u1-u0;d=v1-v0;f=u1*v0-v1*u0;
        var output=new Point();
        if (a*e!=b*d){
            output.setPath((c*e-b*f)/(-a*e+b*d),(-c*d+a*f)/(-b*d+a*e));
            return output;
        }
        else {
            var output1=new Point();
            output.setPath(Math.max(Math.min(u0,u1),Math.min(x0,x1)),Math.max(Math.min(v0,v1),Math.min(y0,y1)))
            output1.setPath(Math.min(Math.max(u0,u1),Math.max(x0,x1)),Math.min(Math.max(v0,v1),Math.max(y0,y1)))
            return [output,output1]
        }
        
    }
    this.length=function(){
        var temp=this.toArray();
        var x1=temp[0][0];
        var x2=temp[1][0];
        var y1=temp[0][1];
        var y2=temp[1][1];
        return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
    }
}
var Poly=function(){
    var g=function(xParameter,yParameter,constant,xInput,yInput){
        return yParameter*yInput-xParameter*xInput-constant;
    };
    var innerAngle=function(dx0,dy0,dx1,dy1,type){
        if (typeof type !="string") type="DEG";
        r0=Math.sqrt(dx0*dx0+dy0*dy0);
        r1=Math.sqrt(dx1*dx1+dy1*dy1);
        var cos=Math.acos((dx0*dx1+dy0*dy1)/(r0*r1))*180/Math.PI;
        var asin=Math.asin((-dx1*dy0+dx0*dy1)/(r0*r1));
        if (cos>90) asin=(asin>0)?(Math.PI-asin):(-Math.PI-asin);
        switch (type.toUpperCase()){
            case "RAD":return asin;
            default: return asin*(180/Math.PI);
        }
    };
    this.path=new String();
    this.setPath=function(path){
        this.path=path;
        if (path=="") return;
        var startPoint=this.toArray()[0];
        var endPoint=this.toArray()[this.toArray().length-1];
        var x0,y0,x1,y1,x2,y2,dx0,dy0,dx1,dy1,r0,r1;
        var temp="";
        var temp2;
        
        if (startPoint[0]==endPoint[0] && startPoint[1]==endPoint[1]){
            for (var i=0;i<this.toArray().length-1;i++){
                temp+=this.toArray()[i][0]+","+this.toArray()[i][1]+" "
            }
            var iAngle=0;
            this.path=temp.substr(0,temp.length-1);
            this.closed=true;
            for (var i=1;i<=this.toArray().length;i++){
                x0=this.toArray()[i-1][0];y0=this.toArray()[i-1][1];
                x1=this.toArray()[i % this.toArray().length][0];y1=this.toArray()[i % this.toArray().length][1];
                x2=this.toArray()[(i+1) % this.toArray().length][0];
                y2=this.toArray()[(i+1) % this.toArray().length][1];
                dx0=x1-x0;dy0=y1-y0;
                dx1=x2-x1;dy1=y2-y1;
                r0=Math.sqrt(dx0*dx0+dy0*dy0);
                r1=Math.sqrt(dx1*dx1+dy1*dy1);
                iAngle+=innerAngle(dx0,dy0,dx1,dy1);
            }
            if (iAngle<0) {
                temp=this.toArray()[0]+" ";
                for (var i=this.toArray().length-1;i>=1;i--){
                    temp+=this.toArray()[i][0]+","+this.toArray()[i][1]+" ";
                }
                this.path=temp.substr(0,temp.length-1);
            }
        }
        if (this.intersect().toArray().length>this.toArray().length) this.selfIntersect=true;
        else {
            temp=this.toArray();
            temp2=this.intersect().toArray();
            
            for (var i=0;i<temp.length;i++){
               
                if (temp2[i][0]!=temp[i][0] || temp2[i][1]!=temp[i][1]) {
                    console.log(temp2[i],temp[i])
                    this.selfIntersect=true;
                }
            }
        }
    };
    this.toArray=function(){
        if (this.path=="") return [];
        var temp=this.path.split(" ");
        var x,y;
        var i=0;
        while (i<temp.length){
            if (temp[i].toString()=="") {
                temp=advArray.remove(temp,i+1);
                i--;
            }
            i++;
            
        }
        for (var i in temp){
            temp[i]=temp[i].split(",");
            if (i>0){
                temp[i]=[isNaN(temp[i][0])?(temp[i-1][0]?temp[i-1][0]:0):temp[i][0],isNaN(temp[i][1])?(temp[i-1][1]?temp[i-1][1]:0):temp[i][1]];
            }
            else temp[i]=[isNaN(temp[i][0])?0:temp[i][0],isNaN(temp[i][1])?0:temp[i][1]];
            temp[i]=[isNaN(Number(temp[i][0]))?undefined:Number(temp[i][0]),isNaN(Number(temp[i][1]))?undefined:Number(temp[i][1])]
            x=temp[i][0];y=temp[i][1]
            if (Math.abs((x-Number(x.toFixed(6)))/x)<Math.pow(10,-10)) temp[i][0]=Number(x.toFixed(6));
            if (Math.abs((y-Number(y.toFixed(6)))/y)<Math.pow(10,-10)) temp[i][1]=Number(y.toFixed(6));
        }
        return temp;
    };
    this.perim=function(){
        var temp=this.toArray();
        var length=0;
        for (var i=0;i<(this.closed?temp.length:(temp.length-1));i++){
            length+=Math.sqrt(Math.pow(temp[i][0]-temp[(i+1)%temp.length][0],2)+Math.pow(temp[i][1]-temp[(i+1)%temp.length][1],2))
        }
        return length;
    };
    this.closed=false;
    this.open=function(){if (this.closed) this.closed=false;};
    this.close=function(){
        var iAngle=0;;
        var x0,y0,x1,x2,y1,y2,dx0,dy0,dx1,dy1,r0,r1;
        if (!this.closed) this.closed=true;
        for (var i=1;i<=this.toArray().length;i++){
            x0=this.toArray()[i-1][0];y0=this.toArray()[i-1][1];
            x1=this.toArray()[i % this.toArray().length][0];y1=this.toArray()[i % this.toArray().length][1];
            x2=this.toArray()[(i+1) % this.toArray().length][0];
            y2=this.toArray()[(i+1) % this.toArray().length][1];
            dx0=x1-x0;dy0=y1-y0;
            dx1=x2-x1;dy1=y2-y1;
            iAngle+=innerAngle(dx0,dy0,dx1,dy1);
        }
            
           /* if (iAngle<0) {
                temp=this.toArray()[0]+" ";
                for (var i=this.toArray().length-1;i>=1;i--){
                    temp+=this.toArray()[i][0]+","+this.toArray()[i][1]+" ";
                }
                this.path=temp.substr(0,temp.length-1);
            }*/
    };
    
    this.selfIntersect=false;
    this.intersect=function(){
        var temp=this.toArray();
        var temp2=[];
        var x0,y0,x1,y1,a,b,c,d,e,f,g1,g2,g3,g4;
        var u0,u1,v0,v1;
        var i,j,t;
        var key;
        
        
        i=0;
        for (i=0;i<=(this.closed?temp.length:(temp.length-1));i++){
            temp2[i]=[];
            if (i>2){
                
                x1=temp[i%temp.length][0];
                y1=temp[i%temp.length][1];
                x0=temp[i-1][0];
                y0=temp[i-1][1];
                b=x1-x0;
                a=y1-y0;
                c=x1*y0-y1*x0;
                for (j=1; j<=i-2;j++){
                    u0=temp[j-1][0];
                    v0=temp[j-1][1];
                    u1=temp[j][0];
                    v1=temp[j][1];
                    e=u1-u0;
                    d=v1-v0;
                    f=u1*v0-u0*v1;
                    g1=g(d,e,f,x1,y1);
                    g2=g(d,e,f,x0,y0);
                    g3=g(a,b,c,u1,v1);
                    g4=g(a,b,c,u0,v0);
                    if (g1*g2<=0){
                        if (g3*g4<=0){
                            if (Math.abs(g1*g2)>Math.pow(10,-9)) temp2[i-1][temp2[i-1].length]=[(c*e-b*f)/(-a*e+b*d),(-c*d+a*f)/(-b*d+a*e)];
                            if (Math.abs(g3*g4)>Math.pow(10,-9)) temp2[j-1][temp2[j-1].length]=[(c*e-b*f)/(-a*e+b*d),(-c*d+a*f)/(-b*d+a*e)];
                        }
                    }
                }
            }
        }
        temp2.pop();
        for (i=0;i<(this.closed?temp.length:(temp.length-1));i++){
            x0=temp[i][0];y0=temp[i][1];
            x1=(i==temp.length-1)?temp[0][0]:temp[i+1][0];y1=(i==temp.length-1)?temp[0][1]:temp[i+1][1];
            if ((x0!=x1 || y0!=y1) && temp2[i].length>1){
                for (j=1;j<temp2[i].length;j++){
                    key=temp2[i][j];
                    keyXY=((x0!=x1)?temp2[i][j][0]:temp2[i][j][1]);
                    abs=(x0!=x1)?((x1>x0)?1:-1):((y1>y0)?1:-1)
                    t=j-1;
                    while (t>=0 && ((x0!=x1)?temp2[i][t][0]:temp2[i][t][1])*abs>keyXY*abs){
                        temp2[i][t+1]=temp2[i][t];
                        temp2[i][t]=key;
                        t--;
                    }
                }
            }
        }
        var output=new Poly();
        var temp3="";
        for (i in temp){
            temp3+=temp[i][0]+","+temp[i][1]+" ";
            for (j in temp2[i]){
                temp3+=temp2[i][j][0]+","+temp2[i][j][1]+" ";
                if (!output.selfIntersect) output.selfIntersect=true;
            }
        }
        output.path=temp3.substr(0,temp3.length-1);
        output.closed=this.closed;
        
        return output;
    };
    this.offset=function(x,y,r,type){
        
        if (typeof type !="string") type="MILTER";
        type=type.toUpperCase();
        if (type!="ROUND" && type!="BEVEL") type="MILTER";
        if (isNaN(Number(r))) r=undefined;
        
        x=x?x:0;y=y?y:0;
        var x0,y0,x1,y1,dx0,dy0,dx1,dy1,dx2,dy2,a,b,c,d,e,f,r0,r1,c1,f1;
        var dist,droit;
        var temp=this.toArray();
        var offsetPath="";
        var rTemp=Infinity;
        
        for (var i=0;i<temp.length;i++){
            //generate linear functions parameters
            x0=temp[i][0];y0=temp[i][1];
            x1=temp[(i+1)%temp.length][0];y1=temp[(i+1)%temp.length][1];
            dx0=x1-x0;dy0=y1-y0;
            dx1=x-x0;dy1=y-y0;
            dx2=x-x1;dy2=y-y1;
            
            /*
             * Determine the point's shortest distance to the Poly
             * If the point's perpendicular line intersects with a line segment of the Poly, the distance would be the distance to that line segment.
             * If the perpendicular line does not intersect with the line segment, the distance would be the shortest distance to each endpoint of the line segment.
             * Droit:Describes the relative positions between the point and the Poly.
             */

            if ((dx0*dx1+dy1*dy0)*(dx0*dx2+dy2*dy0)<0){
                b=x1-x0;
                a=y1-y0;
                c=x1*y0-y1*x0;
                if ((i==temp.length-1) && !this.closed) break;
                dist=Math.abs(a*x-b*y+c)/Math.sqrt(a*a+b*b);
                
            }
            else {
                dist=Math.min(Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0)),Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1)));
            }
            if (rTemp>dist) {
                rTemp=dist;
                droit=dx0*dy1-dx1*dy0;
                droit=(droit>0)?1:(droit<0?-1:0)
            }
        }
        if (!r) r=rTemp;
        
        //If the point is right on the Poly or offset distance is 0, do nothing.
        if (droit*r==0) return;
        for (var i=0;i<temp.length;i++){
            x0=temp[(i+temp.length-1)%temp.length][0];y0=temp[(i+temp.length-1)%temp.length][1];
            x1=temp[i][0];y1=temp[i][1];
            x2=temp[(i+1)%temp.length][0];y2=temp[(i+1)%temp.length][1];
            dx0=x1-x0;dy0=y1-y0;dx1=x2-x1;dy1=y2-y1;
            b=dx0;a=dy0;c=x1*y0-y1*x0;
            e=dx1;d=dy1;f=x2*y1-y2*x1;
            r0=Math.sqrt(a*a+b*b);
            r1=Math.sqrt(d*d+e*e);
            if (!this.closed && (i==0||i==(temp.length-1))){
                if (i==0) offsetPath+=(x1-d*r*droit/r1)+","+(y1+e*r*droit/r1)+" "
                else offsetPath+=(x1-a*r*droit/r0)+","+(y1+b*r*droit/r0)+" "
            }
            else {
                c1=c+b*b*r*droit/r0+a*a*r*droit/r0;
                f1=f+e*e*r*droit/r1+d*d*r*droit/r1;
                switch (type){
                    case "MILTER":{
                        offsetPath+=(c1*e-b*f1)/(-a*e+b*d)+","+(-c1*d+a*f1)/(-b*d+a*e)+" "
                    };break;
                    case "BEVEL":{
                        g1=g(d,e,f1,x1,y1);
                        g2=g(d,e,f1,x0,y0);
                        g3=g(a,b,c1,x2,y2);
                        g4=g(a,b,c1,x1,y1);
                        console.log(d,e,f1,x1,y1,g1,g2,g3,g4)
                        if (g1*g2<=0 && g3*g4<=0) offsetPath+=(c1*e-b*f1)/(-a*e+b*d)+","+(-c1*d+a*f1)/(-b*d+a*e)+" "
                        else {
                            offsetPath+=(x1-a*r*droit/r0)+","+(y1+b*r*droit/r0)+" ";
                            offsetPath+=(x1-d*r*droit/r1)+","+(y1+e*r*droit/r1)+" ";
                        }
                        
                    };break;
                    case "ROUND":{};break;
                }
            }
        }
        var output=new Poly()
        output.setPath(offsetPath.substr(0,offsetPath.length-1));
        output.closed=this.closed;
        return output
    };
    
    /*
     * This function has compatibility issues.
     * r shall be in a format as [[num,num],[num,num],...,[num,num]], otherwise this function will not work and possibly cause errors.
     */
    this.offsetByPoint=function(r,type){
        var rTemp;
        if (typeof type !="string") type="MILTER";
        type=type.toUpperCase();
        if (type!="ROUND" && type!="BEVEL") type="MILTER";
        
        var x0,y0,x1,y1,dx0,dy0,dx1,dy1,dx2,dy2,a,b,c,d,e,f,r0,r1,c1,f1,x,y;
        var dist;
        var temp=this.toArray();
        var temp2;
        var offsetPath="";
        rTemp=Infinity;
        for (var i=0;i<temp.length;i++){
            if (temp[i][0]==temp[(i+1)%temp.length][0] && temp[i][1]==temp[(i+1)%temp.length][1]){
                temp=temp.slice(0,i).concate(temp.slice(i+1,temp.length));
                i--;
            }
            else if ((temp[i][0]-temp[(i-1+temp.length)%temp.length][0])/(temp[i][1]-temp[(i-1+temp.length)%temp.length][1])==(temp[i][0]-temp[(i+1)%temp.length][0])/(temp[i][1]-temp[(i+1)%temp.length][1])){
                temp=temp.slice(0,i).concate(temp.slice(i+1,temp.length));
                i--;
            }
        };
        for (var i=0;i<temp.length;i++){
            if (!isNaN(r[i])){
                r[i]=[r[i],r[i]]
            }
            else if (r[i]==undefined){
                r[i]=[r[i-1][1],r[i-1][1]];
            }
            x0=temp[(i+temp.length-1)%temp.length][0];y0=temp[(i+temp.length-1)%temp.length][1];
            x1=temp[i][0];y1=temp[i][1];
            x2=temp[(i+1)%temp.length][0];y2=temp[(i+1)%temp.length][1];
            dx0=x1-x0;dy0=y1-y0;dx1=x2-x1;dy1=y2-y1;
            b=dx0;a=dy0;c=x1*y0-y1*x0;
            e=dx1;d=dy1;f=x2*y1-y2*x1;
            r0=Math.sqrt(a*a+b*b);
            r1=Math.sqrt(d*d+e*e);
            if (!this.closed && (i==0||i==(temp.length-1))){
                if (i==0) offsetPath+=(x1-d*r[i][1]/r1)+","+(y1+e*r[i][1]/r1)+" "
                else offsetPath+=(x1-a*r[i][0]/r0)+","+(y1+b*r[i][0]/r0)+" "
            }
            else {
                c1=c+b*b*r[i][0]/r0+a*a*r[i][0]/r0;
                f1=f+e*e*r[i][1]/r1+d*d*r[i][1]/r1;
                switch (type){
                    case "MILTER":{
                        offsetPath+=(c1*e-b*f1)/(-a*e+b*d)+","+(-c1*d+a*f1)/(-b*d+a*e)+" "
                        //console.log(a,b,d,e,c1,f1,"/",offsetPath)
                    };break;
                    case "BEVEL":{
                        g1=g(d,e,f1,x1,y1);
                        g2=g(d,e,f1,x0,y0);
                        g3=g(a,b,c1,x2,y2);
                        g4=g(a,b,c1,x1,y1);
                        if (g1*g2<=0 && g3*g4<=0) offsetPath+=(c1*e-b*f1)/(-a*e+b*d)+","+(-c1*d+a*f1)/(-b*d+a*e)+" "
                        else {
                            offsetPath+=(x1-a*r[i][0]/r0)+","+(y1+b*r[i][0]/r0)+" ";
                            offsetPath+=(x1-d*r[i][1]/r1)+","+(y1+e*r[i][1]/r1)+" ";
                        }
                        
                    };break;
                    case "ROUND":{};break;
                }
            }
        }
        var output=new Poly()
        output.setPath(offsetPath.substr(0,offsetPath.length-1));
        output.closed=this.closed;
        var tempIntsct=false;
        temp=output.toArray();
        temp2=output.intersect().toArray();
        for (i=0;i<temp2.length;i++){
            if ((trimNum(temp2[i][0]-temp2[(i+1)%temp2.length][0])==0) && (trimNum(temp2[i][1]-temp2[(i+1)%temp2.length][1])==0)){
                temp2=temp2.slice(0,i).concat(temp2.slice(i+1,temp2.length));
                i--;
            }
        };
        if (output.selfIntersect || temp.length<temp2.length){
            output=output.intersect()
            tempIntsct=true;
        }
        temp=this.toArray();
        temp2=output.toArray()
        for (var i=0;i<temp.length;i++){
            x0=temp[i][0];y0=temp[i][1];
            x1=temp[(i+1)%temp.length][0];y1=temp[(i+1)%temp.length][1];
            dx0=x1-x0;dy0=y1-y0;
            for (var j=0;j<temp2.length;j++){
                x=temp2[j][0];y=temp2[j][1];
                dx1=x-x0;dy1=y-y0;
                dx2=x-x1;dy2=y-y1;
                if (x && y){
                    
                    if (((dx0*dx1+dy1*dy0)*(dx0*dx2+dy2*dy0))<-((x0*x0+y0*y0)*Math.sqrt(x1*x1+y1*y1)*Math.sqrt(x2*x2+y2*y2))*Math.pow(10,-4)){
                        b=x1-x0;
                        a=y1-y0;
                        c=x1*y0-y1*x0;
                        if ((i==temp.length-1) && !this.closed) break;
                        dist=Math.abs(a*x-b*y+c)/Math.sqrt(a*a+b*b);
                        if ((b*y-a*x-c)<-Math.sqrt(a*a+b*b)*Math.pow(10,-6)){
                            //console.log(i,j,x0,y0,x1,y1,x,y,(b*y-a*x-c)/Math.sqrt(a*a+b*b))
                            temp2[j]=[undefined,undefined]
                        }
                    }
                    else {
                        dist=Math.min(Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0)),Math.sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1)));
                    }
                    
                    if (dist) dist=((Math.abs(dist-Number(dist.toFixed(6)))<Math.pow(10,-6))?Number(dist.toFixed(6)):dist);
                    
                    if ((dist-r[i][1])/r[i][1]<-Math.pow(10,-6)){
                        if (tempIntsct) temp2[j]=[undefined,undefined]
                       
                    }
                }
            }
        }
        output.path="";
        
        for (var i=0;i<temp2.length;i++){
            if (temp2[i][0]&&temp2[i][1]){
                if (temp2[i][0]!=temp2[(i+1)%temp2.length][0] || temp2[i][1]!=temp2[(i+1)%temp2.length][1]) output.path+=temp2[i][0]+","+temp2[i][1]+" "
            }
        };
        output.path=output.path.substr(0,output.path.length-1)
        output=output.intersect();
        output.selfIntersect=false;
        return output
    };
    this.area=function(){
        var x0,y0,x1,y1,a,b,c;
        if (this.toArray().length<3) return 0;
        var temp=this.intersect().toArray();
        var area=0;
        var triangle=function(x0,y0,x1,y1,x2,y2){
            var a,b,c,droit;
            b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
            droit=(b*y2-a*x2-c);
            droit=(droit>0)?1:((droit<0)?-1:0);
            var square=Math.abs(Math.max(x0,x1,x2)-Math.min(x0,x1,x2))*(Math.max(y0,y1,y2)-Math.min(y0,y1,y2))
            var tip=Math.abs((x0-x1)*(y0-y1))+Math.abs((x1-x2)*(y1-y2))+Math.abs((x2-x0)*(y2-y0));
            return (droit==0)?0:(droit*(square-0.5*tip))
        };
        if (!this.selfIntersect){
            for (var i=2;i<temp.length;i++){
                area+=triangle(temp[0][0],temp[0][1],temp[i-1][0],temp[i-1][1],temp[i][0],temp[i][1]);
            }
        }
        else {
            var scan=[]
            for (var i=0;i<temp.length;i++){
                scan[i]=[temp[i][0],[]];
                for (var j=0;j<temp.length;j++){
                    x0=temp[j][0];y0=temp[j][1];x1=temp[(j+1)%temp.length][0];y1=temp[(j+1)%temp.length][1];
                    b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
                    if ((x1-temp[i][0])*(x0-temp[i][0])<=0) scan[i][1][scan[i][1].length]=((b==0)?temp[j][1]:((a*temp[i][0]+c)/b));
                }
            }
        }
        return Math.abs(area);
    };
    this.distanceTo=function(where){
        var temp,temp2;
        var a,b,c,d,e,f,x0,y0,x1,y1,u0,v0,u1,v1;
        var g1,g2,g3,g4;
        var l1=new Segment();
        var l2=new Segment();
        var dist=Infinity;
        var tempDist;
        
        if (!(where instanceof Poly) && !(where instanceof Point)) return false;
        if (where instanceof Point){}//to be accomplished
        if (where instanceof Poly){
            temp=this.toArray();
            temp2=where.toArray();
            for (var i=0;i<(this.closed?temp.length:(temp.length-1));i++){
                x0=temp[i%temp.length][0];y0=temp[i%temp.length][1];x1=temp[(i+1)%temp.length][0];y1=temp[(i+1)%temp.length][1];
                b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
                l1.path=x0+","+y0+" "+x1+","+y1;
                for (var j=0;j<(where.closed?temp2.length:(temp2.length-1));j++){
                    
                    u0=temp2[j%temp2.length][0];v0=temp2[j%temp2.length][1];u1=temp2[(j+1)%temp.length][0];v1=temp2[(j+1)%temp.length][1];
                    d=u1-u0;e=v1-v0;f=u1*v0-v1*u0;
                    l2.path=u0+","+v0+" "+u1+","+v1;
                    tempDist=l1.distanceTo(l2);
                    dist=(dist>tempDist)?tempDist:dist;
                }
            }
        }
        return dist;
    }
    this.draw=function(where,args){
        if (this.closed) where.polygon(this.toArray(),args)
        else where.polyline(this.toArray(),args)
    }
    this.split=function(which,conditions){
        if (!(which instanceof Poly)) return false;
        if (which.selfIntersect) return false;
        var temp=this.toArray();
        var temp2=which.toArray();
        var temp3=[];
        var temp4=[];
        var l1,l2,l3,l4;
        var pIntsct;
        var i,j;
        var mirror1=[];
        var mirror2=[];
        l1=new Segment();l2=new Segment();
        for (i=0;i<(this.closed?temp.length:(temp.length-1));i++){
            l1.setPath(temp[i],temp[(i+1)%temp.length]);
            temp3[i]=[];
            mirror1[i]=[]
            for (j=0;j<(which.closed?temp2.length:(temp2.length-1));j++){
                if (i==0) {
                    temp4[j]=[];
                    mirror2[j]=[];
                };
                l2.setPath(temp2[j],temp2[(j+1)%temp2.length]);
                pIntsct=l1.intersect(l2)
                if (pIntsct){
                    
                    if (!pIntsct.length){
                        pIntsct=pIntsct.toArray();
                        //if (pIntsct[0]!=temp[(i+1)%temp.length][0])
                        temp3[i][temp3[i].length]=pIntsct;
                        temp4[j][temp4[j].length]=pIntsct;
                        mirror1[i][mirror1[i].length]=[j,temp4[j].length-1];
                        mirror2[j][mirror2[j].length]=[i,temp3[i].length-1];
                    }
                    else {
                        temp3[i][temp3[i].length]=pIntsct[0].toArray();
                        temp4[j][temp4[j].length]=pIntsct[0].toArray();
                        mirror1[i][mirror1[i].length]=[j,temp4[j].length-1];
                        mirror2[j][mirror2[j].length]=[i,temp3[i].length-1];
                        temp3[i][temp3[i].length]=pIntsct[1].toArray();
                        temp4[j][temp4[j].length]=pIntsct[1].toArray();
                        mirror1[i][mirror1[i].length]=[j,temp4[j].length-1];
                        mirror2[j][mirror2[j].length]=[i,temp3[i].length-1];
                    }
                }
            }
        }
        /*
         * Insert Sort
         */
        var sortPIntsct=function(which,which2,ref,m1,m2){
            var insertSort=function (arr){
                var t,key,key2;
                key=arr[j];
                key2=m1[i][j];
                t=j-1;
                while (t>=0 && (arr[t][0]>key[0] || arr[t][1]>key[1])){
                    arr[t+1]=arr[t];
                    arr[t]=key;
                    
                    m1[i][t+1]=m1[i][t];
                    m2[m1[i][t][0]][m1[i][t][1]]=[i,t+1];
                    m1[i][t]=key2;
                    m2[key2[0]][key2[1]]=[i,t];
                    
                    t--;
                }
                //t=arr.length-1;
                return arr;
            }
            for (var i=0;i<(ref.closed?which.length:(which.length-1));i++){
                if (which2[i].length>1){
                    for (var j=1;j<which2[i].length;j++){
                        which2[i]=insertSort(which2[i])
                    }
                    if ((which[i][0]>which[(i+1)%which.length][0]) || (which[i][0]==which[(i+1)%which.length][0] && which[i][1]>which[(i+1)%which.length][1])){
                        which2[i].reverse();
                        for (var j=0;j<m1[i].length;j++){
                            m2[m1[i][j][0]][m1[i][j][1]]=[0,m1[i].length-j-1];
                        }
                        m1[i].reverse();
                    }
                }
            }
            for (var i=0;i<(ref.closed?which.length:(which.length-1));i++){
                if (which2[i].length>0 && which2[(i+1)%which2.length].length>0){
                    if ((which2[i][which2[i%which2.length].length-1][0]==which2[(i+1)%which2.length][0][0])&&(which2[i%which2.length][which2[i].length-1][1]==which2[(i+1)%which2.length][0][1])){
                        //which2[i]=which2[i].slice(0,which2[i].length-1)
                    }
                }
            }
            /*
            var j=0;
            for (var i=0;i<(ref.closed?which.length:(which.length-1));i++){
                which=which.slice(0,i+1).concat(which2[j]?which2[j]:[]).concat(which.slice(i+1,which.length));
                console.log(i,which[i],which2[j])
                i+=(which2[i]?(which2[j].length):0);
                j++;
            }
            console.log(which)*/
            return [which,which2,m1,m2];
        };
        var polyBetween=function(which,which2,ref,start,end){
            if (!start) start=0;
            if (!end) end=start+1;
            if (end!=start+1){
                var s1=polyBetween(which,which2,start,end-1);
                var s2=polyBetween(which,which2,end-1,end);
                var length1=s1.length;
                var length2=s2.length;
                return s1.slice(0,s1-1).concat(s2.slice(1,s2))
            }
            else {
                var output=[];
                var i1,j1,i2=j2=0;
                var n=0;
                for (var i=0;i<which2.length;i++){
                    for (var j=0;j<which2[i].length;j++){
                        if (n==start) {i1=i;j1=j;}
                        if (n==end) {i2=i;j2=j;}
                        n++;
                    }
                }
                output[output.length]=which2[i1][j1];
                for (var i=i1+1;i<=(i2>=i1?i2:(i2+which.length));i++){
                    output[output.length]=which[i%which.length];
                }
                output[output.length]=which2[i2][j2];
                var i=1;
                
                while (i<output.length){
                    if (output[i][0]==output[i-1][0] && output[i][1]==output[i-1][1]){
                        output=output.slice(0,i).concat(output.slice(i+1,output.length))
                        i--;
                    }
                    i++;
                }
                
            }
            return output;
        }
       
        var concatPoly=function(ref,num){
            var poly1=polyBetween(temp,temp3,ref,num);
            var p=new Point();
            var l=new Segment();
            var ij=matchIJ(temp4,matchNum(temp3,temp4,(num+1)%temp3.length));
            var output=[];
            var temp3Num,temp4Num;
            p.setPath((poly1[poly1.length-2][0]+poly1[poly1.length-1][0])/2,(poly1[poly1.length-2][1]+poly1[poly1.length-1][1])/2);
            l.setPath(temp4[ij[0]][ij[1]],temp2[(ij[0]+1)%temp2.length])
            droit=p.positionTo(l);
            temp4Num=matchNum(temp3,temp4,num+1);
            console.log(p,l,droit)
            if (droit>0) {
                output=polyBetween(temp,temp3,ref,num).slice(0,polyBetween(temp,temp3,ref,num).length-1).concat(polyBetween(temp2,temp4,which,temp4Num));
                temp3Num=matchNum(temp4,temp3,(temp4Num+1)%temp4.length);
            } 
            else if (droit<0){
                output=polyBetween(temp,temp3,ref,num).slice(0,polyBetween(temp,temp3,ref,num).length-1).concat(polyBetween(temp2,temp4,which,temp4Num-1).reverse())
                temp3Num=matchNum(temp4,temp3,(temp4Num-1)%temp4.length);
            }
            else if (droit==0){
                output=polyBetween(temp,temp3,ref,num);
                temp3Num=(num+1)%temp3.length;
            }
            if (output.length>0 && output[0][0]==output[output.length-1][0] && output[0][0]==output[output.length-1][0]) {
                //console.log(temp4Num,temp3Num,concatPoly(ref,temp3Num))
                return output;
            }
            else {
                //output=output.slice(0,output.length);
                //console.log(matchNum(which,ref,temp4Num+1))
                //console.log(temp3Num,concatPoly(temp3Num))
                //output=output.concat(concatPoly(ref,temp3Num)) 
                return output
            }
        }
        var matchIJ=function(which,num){
            var n=0;
            for (var i=0;i<which.length;i++){
                if (which[i].length>0){
                    for (var j=0;j<which[i].length;j++){
                        if (n==num) return [i,j]
                        n++;
                    }
                }
            };
        };
        var matchNum=function(which,which2,num){
            var n=0;
            var thisCoord;
            var thisLength=0;
            var i1,j1;
            for (var i=0;i<which.length;i++){
                if (which[i].length>0){
                    for (var j=0;j<which[i].length;j++){
                        thisLength++;
                    };
                };
            };
            for (var i=0;i<which.length;i++){
                if (which[i].length>0){
                    for (var j=0;j<which[i].length;j++){
                        if ((n%thisLength)==num) {
                            thisCoord=which[i][j];
                            i1=i;j1=j;
                        }
                        n++;
                    };
                };
            };
            n=0;
            for (var i=0;i<which2.length;i++){
                if (which2[i].length>0){
                    for (var j=0;j<which2[i].length;j++){
                        if (thisCoord[0]==which2[i][j][0] && thisCoord[1]==which2[i][j][1]) return n;
                        n++;
                    }
                }
            }
        };
        temp3=sortPIntsct(temp,temp3,this,mirror1,mirror2);
        mirror1=temp3[2];
        mirror2=temp3[3];
        temp3=temp3[1];
        temp4=sortPIntsct(temp2,temp4,which,mirror2,mirror1);
        mirror2=temp4[2];
        mirror1=temp4[3];
        temp4=temp4[1];
        console.log(temp3,temp4,mirror1,mirror2)
        console.log()
        var output=[];
        var temp4Num;
        for (var i=0;i<temp3.length;i++){
            for (var j=0;j<temp3[i].length;j++){
                output[output.length]=new Poly();
                //output[output.length-1]=polyBetween(temp,temp3,this,output.length-1);
                //temp4Num=matchNum(temp3,temp4,output.length%temp3.length);
                //output[output.length-1]=output[output.length-1].concat(polyBetween(temp2,temp4,which,temp4Num-1).reverse());
            }
        }
        
        
       //return output;
    };
    this.rotate=function(x,y,angle,opt){
        if (y==undefined) angle=x;
        if (!opt) opt="DEG"
        if (opt.toUpperCase()!="RAD") opt="DEG";
        if (opt=="DEG") angle*=Math.PI/180;
        /*if (angle==0)
            return false;
        */   
        var temp=this.toArray();
        var temp2="";
        var xMax,yMax,xMin,yMin,xCntr,yCntr,r,xTemp,yTemp;
        xMax=Infinity;yMax=Infinity;xMin=-Infinity;yMin=-Infinity;
        for (var i=0;i<temp.length;i++){
            if (xMax>temp[i][0]) xMax=temp[i][0];
            if (yMax>temp[i][0]) yMax=temp[i][1];
            if (xMin<temp[i][1]) xMin=temp[i][0];
            if (yMin<temp[i][1]) yMin=temp[i][1];
        }
        xCntr=(xMax+xMin)/2;yCntr=(yMax+yMin)/2;
        if (isNaN(x)) x=xCntr; if (isNaN(y)) y=yCntr;
        for (var i=0;i<temp.length;i++){
            xTemp=(x+(temp[i][0]-x)*Math.cos(angle)-(temp[i][1]-y)*Math.sin(angle));
            yTemp=(y+(temp[i][0]-x)*Math.sin(angle)+(temp[i][1]-y)*Math.cos(angle));
            temp2+=trimNum(xTemp)+","+trimNum(yTemp)+" ";
        }
        temp2=temp2.substr(0,temp2.length-1);
        var output=new Poly();
        output.setPath(temp2);
        if (this.closed) output.close=true;
        return output;
    };
    this.toSrf=function(z){
        
        if (this.selfIntersect) {
            return false;
        }
        var temp=this.toArray();
        if (isNaN(z)) z=0;
        var output=new Surface();
        for (var i=0;i<temp.length;i++){
            if (temp[i][0]!=temp[(i+temp.length-1)%temp.length][0] || temp[i][1]!=temp[(i+temp.length-1)%temp.length][1]) output.path+=temp[i][0]+","+temp[i][1]+","+z+" ";
        }
        output.path=output.path.substr(0,output.path.length-1);
        return output;
    }
    this.getBound=function(){
        var xMax,xMin,yMax,yMin;
        var temp;
        xMin=Infinity;yMin=Infinity;xMax=-Infinity;yMax=-Infinity;
        temp=this.toArray();
        for (var i=0;i<temp.length;i++){
            xMin=(xMin>temp[i][0]?temp[i][0]:xMin)
            yMin=(yMin>temp[i][1]?temp[i][1]:yMin)
            xMax=(xMax<temp[i][0]?temp[i][0]:xMax)
            yMax=(yMax<temp[i][1]?temp[i][1]:yMax)
        }
        var output=new Poly();
        output.setPath(xMin+","+yMin+" "+xMax+","+yMin+" "+xMax+","+yMax+" "+xMin+","+yMax);
        output.close();
        return output;
    }
}
var Surface=function(){
    this.path="";
    this.toArray=function(){
        var temp=this.path.split(" ");
        var output=[];
        var x,y,z;
        for (var i=0;i<temp.length;i++){
            if (temp[i]!=""){
                temp[i]=temp[i].split(",")
                if (i==0){
                    x=isNaN(temp[i][0])?0:temp[i][0];
                    y=isNaN(temp[i][1])?0:temp[i][1];
                    z=isNaN(temp[i][2])?0:temp[i][2];
                }
                else {
                    x=isNaN(temp[i][0])?temp[i-1][0]:temp[i][0];
                    y=isNaN(temp[i][1])?temp[i-1][1]:temp[i][1];
                    z=isNaN(temp[i][2])?temp[i-1][2]:temp[i][2];
                }
                output[output.length]=[x,y,z];
            }
        }
        return output;
    };
    this.extrude=function(from,h,start,end,angle){
        if (isNaN(from)) from=0
        else from=Number(from)
        if (isNaN(h)) return false
        else h=Number(h);
        start=start?true:false;
        end=end?true:false;
        angle=isNaN(angle)?20:(angle>180?180:(angle<0?0:angle));
        var temp=this.toArray();
        var output=new PolySrf();
        output.path[0]=new Surface();
        var n=0;
        var dx0,dy0,dx1,dy1;
        //console.log(this)
        for (var i=0;i<temp.length;i++){  
            dx0=temp[i][0]-temp[(i-1+temp.length)%temp.length][0];dy0=temp[i][1]-temp[(i-1+temp.length)%temp.length][1];
            dx1=temp[(i+1)%temp.length][0]-temp[i][0];dy1=temp[(i+1)%temp.length][1]-temp[i][1];
            if (i>0 && Math.abs(innerAngle(dx0,dy0,dx1,dy1))>angle){
                output.path[n].path+=temp[i][0]+","+temp[i][1]+","+Number(temp[i][2]+from);
                n++;
                output.path[n]=new Surface()
            };
            output.path[n].path+=temp[i][0]+","+temp[i][1]+","+Number(temp[i][2]+from)+" ";
            //output.path[n]
        };
        output.path[n].path+=temp[0][0]+","+temp[0][1]+","+Number(temp[0][2]+from);

        var temp2;
        for (var i=0;i<output.path.length;i++){
            
            temp2=output.path[i].path.split(" ");
            for (var j=temp2.length-1;j>=0;j--){
                output.path[i].path+=" "+temp2[j].split(",")[0]+","+temp2[j].split(",")[1]+","+(Number(temp2[j].split(",")[2])+h);
            }
        }
        if (start){
            n++;
            output.path[n]=new Surface();
            for (var i=0;i<temp.length;i++){
                output.path[n].path+=temp[i][0]+","+temp[i][1]+","+(Number(temp[i][2])+from)+" ";
            }
            output.path[n].path=output.path[n].path.substr(0,output.path[n].path.length-1);
            //output.path=output.path.slice(output.path.length-1,output.path.length).concat(output.path.slice(0,output.path.length-1))
        };
        if (end){
            n++;
            output.path[n]=new Surface()
            for (var i=0;i<temp.length;i++){
                output.path[n].path+=temp[i][0]+","+temp[i][1]+","+(Number(temp[i][2])+h+from)+" ";
            }
            output.path[n].path=output.path[n].path.substr(0,output.path[n].path.length-1);
        }
        
        return output;
    },
    this.project=function(where,args,args2,parent){
        var x,y,z,alpha,theta,xNew,yNew;
        var temp=this.toArray();
        var xSum,ySum,zSum;
        var x1,y1,z1;
        x=args.x;y=args.y;z=args.z;
        alpha=args.alpha;theta=args.theta;
        xNew=args.xNew;yNew=args.yNew;zoom=args.zoom;
        xSum=0;ySum=0;zSum=0;
        for (var i=0;i<temp.length;i++){
            xSum+=Number(temp[i][0]);
            ySum+=Number(temp[i][1]);
            zSum+=Number(temp[i][2]);
        };
        var output=new Poly();
        xSum/=temp.length;ySum/=temp.length;zSum/=temp.length;
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
        for (var i=0;i<temp.length;i++){
            x1=(temp[i][0]-x);
            y1=(temp[i][1]-y);
            z1=(temp[i][2]-z);
            output.path+=Number((x1*Math.cos(alpha)+y1*Math.sin(alpha))*zoom+xNew)+","+Number(((-x1*Math.sin(alpha)+y1*Math.cos(alpha))*Math.sin(theta)-z1*Math.cos(theta))*zoom+yNew)+" "
        }
        output.path=output.path.substr(0,output.path.length-1);
        output.close();
        where.polygon(parent,output.toArray(),args2)
    }
}
var PolySrf=function(){
    this.path=[];
    this.concat=function(which){
        if (!(which instanceof PolySrf)) return false;
        var output=new PolySrf();
        output.path=this.path.concat(which.path);
        return output;
    };
    this.project=function(where,args,args2,parent){
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
        
        var temp;
        var min=[];
        var max=[];
        var avr=[];
        var projYTemp=[];
        var t,key;
        var avrTemp;
        key=new Surface();
        
        for (var i=0;i<this.path.length;i++){
            avr[i]=[];
            temp=this.path[i].toArray();
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
            key.path=this.path[i].path;
            avrTemp=avr[i];
            minTemp=min[i];
            maxTemp=max[i];
            t=i-1;
            while (t>=0){
                projYTemp[0]=-avr[t][0]*Math.sin(alpha)+avr[t][1]*Math.cos(alpha);
                projYTemp[1]=-avr[t+1][0]*Math.sin(alpha)+avr[t+1][1]*Math.cos(alpha);
                if ((avr[t+1][2]>avr[t][2] && min[t+1][2]>min[t][2]) || (min[t+1][2]==min[t][2] && projYTemp[1]>projYTemp[0])) break;
                this.path[t+1].path=this.path[t].path;
                this.path[t].path=key.path;
                avr[t+1]=avr[t];
                avr[t]=avrTemp;
                min[t+1]=min[t];min[t]=minTemp;
                max[t+1]=max[t];max[t]=maxTemp;
                t--;
            }
        }
        for (var i=0;i<this.path.length;i++){
            this.path[i].project(where,args,args2,parent)
        }
    };
}
