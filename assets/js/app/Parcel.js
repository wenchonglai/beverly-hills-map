/**
 * @author Wenchong Lai
 */
var geoLib=new GeoLib();
var Parcel=function(){
    this.shape=undefined;
    this.irregular=true;
    this.lotLine={
        whole:new Poly(),
        front:new Poly(),
        streetSide:new Poly(),
        leftSide:new Poly(),
        rightSide:new Poly(),
        rear:new Poly(),
        street:new Poly(),
        orientation:undefined,
    };
    this.stbk={
        front:undefined,
        street:undefined,
        side1:undefined,
        side2:undefined,
        street:undefined
    },
    this.isStrLot=false;
    this.generateBldg=function(DGL,which){
        geoLib.clear();
        var PBAOrtho=this.PBA.rotate(this.PBA.toArray()[0][0],this.PBA.toArray()[0][1],-this.lotLine.orientation);
        var temp=PBAOrtho.toArray();
        var xMin,yMin,xMax,yMax,aMax;
        var xG0,yG0,xG1,yG1;
        var l1,l2,l3,l4,l;
        var isIntsct=false;
        var p1,p4;
        var iFin,jFin,wFin,hFin;
        var d1,d2;
        var PBATemp=this.PBA;
        var aPBATemp=this.PBA.area();
        var angle=this.lotLine.orientation;
        var thisBldgHeight=DGL.height.plate/2;
        var sidewalk={
            pedZone:new Poly(),
            lscpZone:new Poly()
        };
        
        /*
         * Generate Roof Lines
         */
        var generateRoofLine=function(which,args){//WARNING: Only applicable to orthogonal polygons at present.
            var temp=which.toArray();
            which.path="";
            var dx0,dy0,dx1,dy1;
            for (var i=0;i<temp.length;i++){
                dx0=temp[i][0]-temp[(i-1+temp.length)%temp.length][0];
                dy0=temp[i][1]-temp[(i-1+temp.length)%temp.length][1];
                dx1=-temp[i][0]+temp[(i+1)%temp.length][0];
                dy1=-temp[i][1]+temp[(i+1)%temp.length][1];
                if (dx0/dy0!=dx1/dy1 && !isNaN(dx0/dy0)) which.path+=temp[i][0]+","+temp[i][1]+" ";
            }
            which.path=which.path.substr(0,which.path.length-1);
            temp=which.toArray();
            if (isNaN(args.start)) args.start=0;
            if (isNaN(args.slope)) args.slope=1;
            var g=function(xParameter,yParameter,constant,xInput,yInput){
                return yParameter*yInput-xParameter*xInput-constant;
            };
            if (!(which instanceof Poly)) return false;
            var lArr=[];//eligible segments - Le
            var pArr=[];//eligible points - Pe
            var sArr=which.toSrf(args.start);
            for (var i=0;i<temp.length;i++){
                lArr[i]=new Segment();
                lArr[i].setPath(temp[i],temp[(i+1)%temp.length]);//Le[i]=PolyPt[i] to PolyPt[i+1]
                pArr[i]=new Point();
                pArr[i].setPath(temp[(i+1)%temp.length]);//Pe[i]=Eligible Pt between Le[i] && Le[i+1]
            };
            var recurN=0;
            var which1=new Poly();
            which1.setPath(which.path);
            which1.close();
            var which2=new Poly();
            which2.setPath(which.path);
            which2.close();
            var recurRL=function(which,sArr,lArr,pArr){
                
                var lTempArr=[];
                var pTempArr=[];
                var x,y,x1,y1,x2,y2,dx1,dy1,dx2,dy2,u1,v1,u2,v2;
                var a,b,c,d,e,f;
                var length=lArr.length;
                var temp;
                var start,end,start1,start2;
                var tempPoly;
                var pTemp=new Point();
                var generateSrf=function(which,whichLine){
                    if (!(which instanceof Poly)) return "";
                    var pTemp=new Point();
                    var temp;
                    var output="";
                    temp=which.rotate(PBATemp.toArray()[0][0],PBATemp.toArray()[0][1],angle).toArray();
                    for (var j=0;j<temp.length;j++){
                        pTemp.setPath(which.toArray()[j]);
                        output+=temp[j][0]+","+temp[j][1]+","+(pTemp.distanceTo(whichLine,true)*args.slope+args.start)+" "
                        //console.log(temp[j][0],temp[j][1],pTemp.distanceTo(lArr[(i+1)%length],true)*args.sltemp[j][0],temp[j][1],pTemp.distanceTo(lArr[(i+1)%length],true)*args.slope+startope+start);
                    }
                    return output;
                }
                
                for (var i=0;i<length;i++){
                    lTempArr[i]=new Segment();
                    x=pArr[i].toArray()[0];
                    y=pArr[i].toArray()[1];
                    x1=lArr[i].toArray()[0][0];
                    y1=lArr[i].toArray()[0][1];
                    x2=lArr[(i+1)%length].toArray()[1][0];
                    y2=lArr[(i+1)%length].toArray()[1][1];
                    dx1=x1-lArr[i].toArray()[1][0];
                    dy1=y1-lArr[i].toArray()[1][1];
                    dx2=x2-lArr[(i+1)%length].toArray()[0][0];
                    dy2=y2-lArr[(i+1)%length].toArray()[0][1];
                    dx1=dx1>0?1:(dx1<0?-1:0);
                    dy1=dy1>0?1:(dy1<0?-1:0);
                    dx2=dx2>0?1:(dx2<0?-1:0);
                    dy2=dy2>0?1:(dy2<0?-1:0);
                    if (Math.abs(dx1*dy2)==Math.abs(dy1*dx2) && ((dx1*y2-dy1*x2)==(dx1*y1-dy1*x1))) {
                        lTempArr[i].setPath(x,y,x,y);
                        //svg.polyline(lTempArr[i].toArray(),{strokeWidth:2,stroke:"#ff0000"})
                    }
                    else lTempArr[i].setPath(x,y,x+(dx1+dx2)*500,y+(dy1+dy2)*500);
                }
                var thisPoint=new Point();
                var thisPoint2=new Point();
                var x2,y2;
                for (var i=0;i<length;i++){
                    a=lTempArr[i].toArray()[1][1]-lTempArr[i].toArray()[0][1];
                    b=lTempArr[i].toArray()[1][0]-lTempArr[i].toArray()[0][0];
                    a=a>0?1:(a<0?-1:0);
                    b=b>0?1:(b<0?-1:0);
                    x=pArr[i].toArray()[0];
                    y=pArr[i].toArray()[1];
                    c=b*y-a*x;
                    
                    for (j=i+1;j<i+2;j++){
                        d=lTempArr[j%length].toArray()[1][1]-lTempArr[j%length].toArray()[0][1];
                        e=lTempArr[j%length].toArray()[1][0]-lTempArr[j%length].toArray()[0][0];
                        d=d>0?1:(d<0?-1:0);
                        e=e>0?1:(e<0?-1:0);
                        x1=pArr[j%length].toArray()[0];
                        y1=pArr[j%length].toArray()[1];
                        f=e*y1-d*x1;
                        //if (b*d-a*e==0) console.log(a,b,c,d,e,f)
                        if (b*d-a*e==0 && c*b==e*f){
                            if ((a==0 && b==0 && c==0) || (d==0 && e==0 && f==0)){
                                if (x==x1 || y==y1){
                                    lTempArr[i].setPath(x,y,x1,y1);
                                    lTempArr[j%length].setPath(x1,y1,x,y);
                                }
                            }
                            else {
                                lTempArr[i].setPath(x,y,x1,y1);
                                lTempArr[j%length].setPath(x1,y1,x,y);
                            }  
                        }
                        else if (b*d-a*e!=0){
                            x2=(c*e-b*f)/(-a*e+b*d);y2=(-c*d+a*f)/(-b*d+a*e);
                            thisPoint.setPath(x2,y2);
                            if (thisPoint.positionTo(which)>=0 && lTempArr[i].length()>Math.sqrt(Math.pow(x-x2,2)+Math.pow(y-y2,2))){
                                lTempArr[i].setPath(x,y,x2,y2);
                            };
                            if (thisPoint.positionTo(which)>=0 && lTempArr[j%length].length()>Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2))){
                                lTempArr[j%length].setPath(x1,y1,x2,y2);
                            };
                        }
                    }
                }           
                
                tempPoly=new Poly();
                //tempP=new Point();
                var distTemp=Infinity;
                var iTemp=-1;
                var pTemp1=new Point();
                for (var i=0;i<length;i++){
                    x=lTempArr[i].toArray()[1][0];
                    y=lTempArr[i].toArray()[1][1];
                    x1=lTempArr[(i+1)%length].toArray()[1][0];
                    y1=lTempArr[(i+1)%length].toArray()[1][1];
                    //console.log(x,y,x1,y1)
                    if ((x==x1 && y==y1) || (x==lTempArr[(i+1)%length].toArray()[0][0] && y==lTempArr[(i+1)%length].toArray()[0][1]) || (x1==lTempArr[i].toArray()[0][0] && y1==lTempArr[i].toArray()[0][1])){
                        //console.log(recurN)
                        which.path=" "+which.path+" ";
                        start=which.path.search(" "+lTempArr[i].toArray()[0][0]+","+lTempArr[i].toArray()[0][1]+" ");
                        end=which.path.search(" "+lTempArr[(i+1)%length].toArray()[0][0]+","+lTempArr[(i+1)%length].toArray()[0][1]+" ");
                        which.path=which.path.substr(1,which.path.length-2);
                        if (x==x1 && y==y1) {
                            pTemp.setPath(x,y)
                        }
                        else if (x==lTempArr[(i+1)%length].toArray()[0][0] && y==lTempArr[(i+1)%length].toArray()[0][1]) {
                            pTemp.setPath(lTempArr[i].toArray()[0]);
                            //pTemp1.setPath(lTempArr[i].toArray()[0]);
                            //console.log(pTemp.distanceTo(lArr[(i+1)%length],true),pTemp1.distanceTo(lArr[(i+1)%length],true))
                        }
                        else{
                            pTemp.setPath(lTempArr[(i+1)%length].toArray()[0]);
                        };
                        
                        if (pTemp.distanceTo(lArr[(i+1)%length],true)<=pTemp.distanceTo(which2)){
                            iTemp=((distTemp>pTemp.distanceTo(lArr[(i+1)%length],true))?i:iTemp);
                            pTemp1.path=((distTemp>pTemp.distanceTo(lArr[(i+1)%length],true))?pTemp.path:pTemp1.path);
                            distTemp=((distTemp>pTemp.distanceTo(lArr[(i+1)%length],true))?pTemp.distanceTo(lArr[(i+1)%length],true):distTemp);
                        }
                        i++;
                    }
                }
                if (iTemp>=0){
                    i=iTemp;
                    /*
                    x=lTempArr[i].toArray()[1][0];
                    y=lTempArr[i].toArray()[1][1];*/
                    x=pTemp1.toArray()[0];y=pTemp1.toArray()[1]
                    which.path=" "+which.path+" ";
                    start=which.path.search(" "+lTempArr[i].toArray()[0][0]+","+lTempArr[i].toArray()[0][1]+" ");
                    end=which.path.search(" "+lTempArr[(i+1)%length].toArray()[0][0]+","+lTempArr[(i+1)%length].toArray()[0][1]+" ");
                    start1=which.path.search(" "+pArr[i].toArray()[0]+","+pArr[i].toArray()[1]+" ");
                    end1=which.path.search(" "+pArr[(i+1)%length].toArray()[0]+","+pArr[(i+1)%length].toArray()[1]+" ");
                    which.path=which.path.substr(1,which.path.length-2);
                    if (start<end){
                        //which.setPath(which.path.substr(end,start-end)+" "+x+","+y+" ");
                        tempPoly.setPath(which.path.substr(start,end-start+(lTempArr[(i+1)%length].toArray()[0][0]+","+lTempArr[(i+1)%length].toArray()[0][1]).length)+" "+x+","+y);    
                    }
                    else tempPoly.setPath(which.path.substr(start,which.path.length-start).concat(" "+which.path.substr(0,end+(lTempArr[(i+1)%length].toArray()[0][0]+","+lTempArr[(i+1)%length].toArray()[0][1]).length))+" "+x+","+y);
                    sArr.path[sArr.path.length]=new Surface();
                    sArr.path[sArr.path.length-1].path=generateSrf(tempPoly,lArr[(i+1)%length]);
                    lArr[(i+1)%length]=undefined;
                    pArr[(i+1)%length]=undefined;
                    if (start1<end1){
                        which.setPath(which.path.substr(0,start+(pArr[i].toArray()[0]+","+pArr[i].toArray()[1]).length)+" "+x+","+y+" "+which.path.substr(end,which.path.length-end));
                    }
                    else {
                        which.setPath(which.path.substr(end,start-end+(pArr[i].toArray()[0]+","+pArr[i].toArray()[1]).length)+" "+x+","+y);
                    }
                    pArr[i].setPath(x,y);
                    //svg.polygon(tempPoly.rotate(PBATemp.toArray()[0][0],PBATemp.toArray()[0][1],0).toArray(),{id:recurN+"/"+iTemp,opacity:0.5,fill:(recurN==0)?"#ff0000":(recurN==1?"#ff7f3f":(recurN==2?"#ffff00":(recurN==3?"#00ff00":(recurN==4?"#00ffff":"#0000ff")))),strokeLinecap:"round",style:"stroke-linejoin:round"});
                    which.close();
                }
                else {
                   // svg.polygon(which.toArray(),{id:"123",strokeWidth:1,stroke:"#ff0000"})
                    
                    //return;
                }
                for (var i=0;i<length;i++){
                        //if (recurN==7) svg.polyline(lTempArr[i].toArray(),{strokeWidth:1,stroke:(recurN==0)?"#ff0000":(recurN==1?"#ff7f3f":(recurN==2?"#ffff00":(recurN==3?"#00ff00":(recurN==4?"#00ffff":"#0000ff")))),style:"stroke-dasharray:2,2"})//
                    }
                var i=0
                while (i<lArr.length){
                    if (!lArr[i]){
                        lArr=lArr.slice(0,i).concat(lArr.slice(i+1,lArr.length));
                        pArr=pArr.slice(0,i).concat(pArr.slice(i+1,pArr.length));   
                        i--;
                    }
                    i++;
                }
                recurN++;
                
                
                if (pArr.length>2 && recurN<10){
                    recurRL(which,sArr,lArr,pArr);
                }
                else {
                    for (var i=0;i<pArr.length;i++){
                        //if (recurN==1) {
                            //svg.circle(pArr[i].toArray()[0],pArr[i].toArray()[1],1)
                            //svg.polygon(lTempArr[i].toArray(),{stroke:"#ff0000",strokeWidth:1})
                        //}
                    }
                
                    //svg.polygon(which.toArray(),{strokeWidth:1,stroke:"#000000",fill:"none"})
                    if (pArr.length==1) {
                        which.path=" "+which.path+" ";
                        start=which.path.search(" "+pArr[0].toArray()[0]+","+pArr[0].toArray()[1]+" ");
                        end=start+(pArr[0].toArray()[0]+","+pArr[0].toArray()[1]).length;
                        end+=which.path.substr(start+(pArr[0].toArray()[0]+","+pArr[0].toArray()[1]).length,which.path.length).search(" "+pArr[0].toArray()[0]+","+pArr[0].toArray()[1]+" ");
                        tempPoly.path=which.path.substr(start,end-start);
                        which.path=which.path.substr(0,start)+which.path.substr(end,which.path.length-end);
                        which.path=which.path.substr(1,which.path.length-2);
                        sArr.path[sArr.path.length]=new Surface();
                        sArr.path[sArr.path.length-1].path=generateSrf(((which.area()==0)?tempPoly:which),lArr[0]);
                    }
                    else if (pArr.length==2){
                        which.path=" "+which.path+" ";
                        start1=which.path.search(" "+pArr[0].toArray()[0]+","+pArr[0].toArray()[1]+" ");
                        end1=which.path.search(" "+pArr[1].toArray()[0]+","+pArr[1].toArray()[1]+" ");
                        if (end1==start1) {
                            end1=(which.path.substr(0,start1).concat(which.path.substr(start1+(" "+pArr[0].toArray()[0]+","+pArr[0].toArray()[1]).length,which.path.length))).search(" "+pArr[1].toArray()[0]+","+pArr[1].toArray()[1]+" ");
                            if (end1>which.path.substr(0,start1).length) end1+=(" "+pArr[0].toArray()[0]+","+pArr[0].toArray()[1]).length;
                        }
                        which.path=which.path.substr(1,which.path.length-2);
                        
                        if (start1>end1){
                            start=end1;end=start1;
                        }
                        else {
                            start=start1;end=end1;
                            var pTemp=pArr[0];
                            pArr[0]=pArr[1];
                            pArr[1]=pTemp;
                        }
                        
                        if (which.path.search(lArr[0].toArray()[0][0]+","+lArr[0].toArray()[0][1])>=start){
                            lArr[2]=lArr[0];
                            lArr[0]=lArr[1];
                            lArr[1]=lArr[2];
                        }
                        tempPoly.setPath(which.path.substr(start,end-start+(pArr[0].toArray()[0]+","+pArr[0].toArray()[1]).length));
                        if (tempPoly.area()==0){
                            tempPoly.setPath(which.path.substr(end,which.path.length-end));
                            which.setPath(which.path.substr(0,end));
                        }
                        else which.setPath(which.path.substr(end,which.path.length-end).concat(" "+which.path.substr(0,start+(pArr[1].toArray()[0]+","+pArr[1].toArray()[1]).length)));
                        //if (tempPoly.path.search(x+","+y)!=0) tempPoly.path+=" "+x+","+y;
                        //svg.polygon(svgMain,which.toArray(),{id:"123"})
                        sArr.path[sArr.path.length]=new Surface();
                        sArr.path[sArr.path.length-1].path=generateSrf(tempPoly,lArr[1]);
                        sArr.path[sArr.path.length]=new Surface();
                        sArr.path[sArr.path.length-1].path=generateSrf(which,lArr[0]);
                    }
                    sArr1=sArr;
                }
            };
            var sArr=new PolySrf();
            var sArr1= new PolySrf();
            recurRL(which1,sArr,lArr,pArr);
            geoLib.append(sArr1,"A-ROOF")
            for (var i=0;i<sArr1.path.length;i++){
                for (var j=0;j<sArr1.path[i].toArray().length;j++) {
                    thisBldgHeight=(thisBldgHeight>sArr1.path[i].toArray()[j][2]?thisBldgHeight:sArr1.path[i].toArray()[j][2])
                }
            }
        }
        
        
        /*
         * Determine how big the orthogonal bounding box for building construction could be.
         */
        p1=new Point();p4=new Point();
        l1=new Segment();l2=new Segment();l3=new Segment();l4=new Segment();l=new Segment();
        xMin=Infinity;yMin=Infinity;xMax=-Infinity;yMax=-Infinity;
        aMax=1000;
        for (var i=0;i<temp.length;i++){
            if (xMin>temp[i][0]) xMin=temp[i][0];
            if (yMin>temp[i][1]) yMin=temp[i][1];
            if (xMax<temp[i][0]) xMax=temp[i][0];
            if (yMax<temp[i][1]) yMax=temp[i][1];
        };
        xG0=(xMin>0)?Math.floor(xMin/1):Math.round(xMin/1);
        yG0=(yMin>0)?Math.floor(yMin/1):Math.round(yMin/1);
        xG1=(xMax>0)?3*Math.floor(xMax/3):3*Math.round(xMax/3);
        yG1=(yMax>0)?3*Math.floor(yMax/3):3*Math.round(yMax/3);
        var tempModule=Math.round(aPBATemp/7500);
        for (var i=xG0;i<=xG1-Math.sqrt((aMax>1728)?aMax/3:576);i+=tempModule*1+1){
            //console.log(Math.sqrt((aMax>1728)?aMax/3:576),yG0,yG1)
            for (var j=yG0;j<=yG1-Math.sqrt((aMax>1728)?aMax/3:576)*tempModule;j+=tempModule*1+1){
                p1.setPath(i,j);
                for (var i1=xG1;i1>=i+Math.sqrt((aMax>1728)?(aMax/3):576);i1-=tempModule+1){
                    if (p1.positionTo(PBAOrtho)<1) {
                        //console.log(i,j,i1)
                        isIntsct=true;
                        break;
                    }
                    l1.setPath(i,j,i1,j);
                    for (var j1=yG1;j1>=j+aMax/(i1-i);j1-=tempModule+1){
                        p4.setPath(i1,j1);
                        if (p4.positionTo(PBAOrtho)<1){
                            isIntsct=true;
                        }
                        else {
                            l2.setPath(i1,j,i1,j1);
                            l3.setPath(i1,j1,i,j1);
                            l4.setPath(i,j1,i,j);
                            isIntsct=false;
                            for (var k=0;k<temp.length;k++){
                                l.setPath(temp[k],temp[(k+1)%temp.length]);
                                if (l1.distanceTo(l)==0 || l2.distanceTo(l)==0 || l3.distanceTo(l)==0 || l4.distanceTo(l)==0){
                                    isIntsct=true;
                                    break;
                                }
                            }
                            if (isIntsct==false){
                                if (aMax<(j1-j)*(i1-i)) {
                                    aMax=(j1-j)*(i1-i);
                                    iFin=i;jFin=j;wFin=i1-i;hFin=j1-j;
                                    //svg.rect(i,j,i1-i,j1-j,{fill:"red",opacity:.1})
                                    break;
                                }
                                
                            };
                            
                        }
                        //if (p4.positionTo(PBAOrtho)==1) {
                            //break;
                        //};
                        if (j1<(yG1-tempModule*3-3)) j1-=tempModule*2+2;
                    }
                    if (i1<(xG1-tempModule*3-3)) i1-=tempModule*2+2;
                }
                if (p1.positionTo(PBAOrtho)==1) {
                    break;
                }
                if (j>(yG0+tempModule*3+3)) j+=Math.round(aPBATemp/7500)*2+2;
                if (iFin && jFin && wFin && hFin && ((i>xG1/2+xG0/2) || (j>yG1/2+yG0/2))) {break;}
            }
            if (i>(xG0+tempModule*3+3)) i+=tempModule*2+2
        }
        
         temp=which.lotLine.front.toArray();
        /*
         * Generate Sidewalk
         */
        var tempX=which.lotLine.whole.offset(-100,-100,100).toArray()[0][0];
        var tempY=which.lotLine.whole.offset(-100,-100,100).toArray()[0][1];
        sidewalk.pedZone.path=which.lotLine.front.offset(tempX,tempY,6).path+" ";
        for (var i=temp.length-1;i>=0;i--){
            sidewalk.pedZone.path+=temp[i][0]+","+temp[i][1]+" ";
        }
        sidewalk.pedZone.path=sidewalk.pedZone.path.substr(0,sidewalk.pedZone.path.length-1);
        
        sidewalk.lscpZone.path=which.lotLine.front.offset(tempX,tempY,6).path+" ";
        temp=which.lotLine.front.offset(tempX,tempY,15).toArray();
        for (var i=temp.length-1;i>=0;i--){
            sidewalk.lscpZone.path+=temp[i][0]+","+temp[i][1]+" ";
        }
        sidewalk.lscpZone.path=sidewalk.lscpZone.path.substr(0,sidewalk.lscpZone.path.length-1);
        
        geoLib.append(sidewalk.pedZone.toSrf(),"V-SDWK-PED");
        geoLib.append(which.shape.toSrf(),"V-PRCL");
        /*
         * Generate 1st Floor Bldg Footprint (Orthogonal)
         */
        var floorTemp=generateFloor(DGL,DGL.area.total(this.shape.area()),iFin,jFin,wFin,hFin);
        var floor=[];
        var entry=new Poly();
        if (floorTemp[0]){
            floor[0]=new Poly();
            for (var i=0;i<floorTemp[0].length;i++){
                floor[0].path+=floorTemp[0][i][0]+","+floorTemp[0][i][1]+" ";
            }
            floor[0].path=floor[0].path.substr(0,floor[0].path.length-1);floor[0].close();
            entry.setPath(((floorTemp[0][0][0]+floorTemp[0][1][0])/2-3)+","+(yG0-DGL.stbk.front()-6)+" "+((floorTemp[0][0][0]+floorTemp[0][1][0])/2-3)+","+floorTemp[0][0][1]+" "+((floorTemp[0][0][0]+floorTemp[0][1][0])/2+3)+","+floorTemp[0][0][1]+" "+((floorTemp[0][0][0]+floorTemp[0][1][0])/2+3)+","+(yG0-DGL.stbk.front()-6))
            geoLib.append(entry.rotate(this.PBA.toArray()[0][0],this.PBA.toArray()[0][1],this.lotLine.orientation).toSrf(),"V-SDWK-PED")
            geoLib.append(sidewalk.lscpZone.toSrf(),"V-SDWK-LSCP")
            geoLib.append(which.shape.toSrf(),"V-PRCL-OTLN");
            geoLib.append(which.PBA.toSrf(),"V-PBA");
            geoLib.append(floor[0].rotate(this.PBA.toArray()[0][0],this.PBA.toArray()[0][1],this.lotLine.orientation).toSrf().extrude(0,DGL.height.plate/2,false,true),"A-FLOR")
            
            let totalFlrArea = floor[0].area();

            if (floorTemp[1]){
                floor[1]=new Poly();
                for (var i=0;i<floorTemp[1].length;i++){
                    floor[1].path+=floorTemp[1][i][0]+","+floorTemp[1][i][1]+" ";
                }
                floor[1].path=floor[1].path.substr(0,floor[1].path.length-1);floor[1].close();
                geoLib.append(floor[1].rotate(this.PBA.toArray()[0][0],this.PBA.toArray()[0][1],this.lotLine.orientation).toSrf().extrude(DGL.height.plate/2,DGL.height.plate/2,false,false),"A-FLOR")
                $("#Area_Actual").html( ( totalFlrArea += floor[1].area() ) +" sf");
            }
            generateRoofLine((floor[1]?floor[1]:floor[0]).offset(-1000,-1000,1.5),{start:(floor[1]?DGL.height.plate:(DGL.height.plate/2)),slope:DGL.height.slope});
            
            if (wFin*hFin/which.PBA.area()<0.75){
                $("#Error_Log").css("color","#ff7f7f");
                $("#Error_Log").html("Due to the irregular shape of the parcel, this program may fail to illustrate maximum built-out.");
                //$("#Error_Log").show();
            }
            else if (totalFlrArea/DGL.area.total(which.shape.area())<0.80){
                $("#Error_Log").css("color","#ff0000");
                $("#Error_Log").html("The given zoning regulations are already severely limiting buildable area!")
            }
            else if (totalFlrArea/DGL.area.total(which.shape.area())<0.95){
                $("#Error_Log").css("color","#df5f5f");
                $("#Error_Log").html("The given zoning regulations are already limiting buildable area.")
            }
            else{
                $("#Error_Log").css("color","#7f7f7f");
                $("#Error_Log").html("Maximum built-out can be reached with given zoning regulations.");
            }
        }
        else {
            $("#Area_Actual").html("-");
            $("#Error_Log").css("color","#bf0000");
            $("#Error_Log").html("The given parameters are too restrictive. No habitable structure can be built within Principal Building Area.")
            //$("#Error_Log").show();
            geoLib.append(sidewalk.lscpZone.toSrf(),"V-SDWK-LSCP")
            geoLib.append(which.shape.toSrf(),"V-PRCL-OTLN");
            geoLib.append(which.PBA.toSrf(),"V-PBA");
        }
        geoLib.append(this.PBA.toSrf().extrude(0,thisBldgHeight,false,true),"V-BULK");
    }
    this.load=function(poly,DGL){
        $("body").css("cursor","wait");
        geoLib.clear();
        $(svgMain).empty();
        if (!(poly instanceof Poly)) return false   
        else if (poly.selfIntersect) return false
        else {
            var minX=Infinity,minY=Infinity;var minX=Infinity,minY=Infinity;
            //var x0,y0,x1,y1,x2,y2,dx0,dy0,dx1,dy1,dx2,dy2,r0,r1,a,b,c,x,y;
            var lotLinePath={
                whole:"",
                front:"",
                streetSide:"",
                leftSide:"",
                rightSide:"",
                rear:"",
            }
            var startPoint,nextPoint;
            var arr;
            var stbkTemp=[];
            var stbkTemp2=[];
            var temp=[];
            var temp2=[];
            
            /*
             * Transform the matrix from original 0.001"=1' SVG file to 1pix=1' geometry
             */
            var convertToScale=function(){
                var toScale="";
                var temp=poly.toArray();
                for (var i=0;i<temp.length;i++){
                    minX=Math.min(minX,temp[i][0]);
                    minY=Math.min(minY,temp[i][1]);
                };
                for (var i=0;i<temp.length;i++){
                    if (temp[i][0][0]!=temp[(i+1)%temp.length][0] || temp[i][0][1]!=temp[(i+1)%temp.length][1]) toScale+=((poly.toArray()[i][0]-minX)/scale)+","+((poly.toArray()[i][1]-minY)/scale)+" ";//TBC
                }
                return toScale;
            }
            
            /*
             * determine the type(front/street/side/rear) of parcel line segments
             */
            var identifyLotLine=function(s,i,j){
                switch (s){
                    case "11":{
                        lotLinePath.front+=arr.coord[i]+" ";
                    };break;
                    case "12":;case "21":;case "22":{
                        lotLinePath.streetSide+=arr.coord[i]+" ";
                    };break;
                    case "10":{
                        lotLinePath.leftSide+=arr.coord[i]+" ";
                    };break;
                    case "01":{
                        lotLinePath.rightSide+=arr.coord[i]+" ";
                    };break;
                    case "20":;case "02":; case "00":{
                        lotLinePath.rear+=arr.coord[i]+" ";
                    };break;
                }
            }
            
            /*
             * determine the setback distances of parcel line segments
             */
            var identifyStbk=function(s,input){
                switch (s){
                    case "11":{
                        return "front";
                    };break;
                    case "12":;case "21":;case "22":{
                        return "street";
                    };break;
                    case "10":{
                        return "side1";
                    };break;
                    case "01":{
                        return "side2";
                    };break;
                    case "20":;case "02":; case "00":{
                        return "rear";
                    };break;
                }
            };
            
            /*
             * Determine the breakpoints of parcel lines.
             */
            var generateBreakpoint=function(){
                var totalAngle;
                var dist;
                var absTj;
                var i0,i2;
                var x0,y0,x1,y1,x2,y2;
                var color="black";
                var pathArray;
                
                /*
                 * Generate breakpoints
                 * Closed at both sides if lengths at both sides >2.5% of perim and the inner angle is larger than 30 deg
                 * Open at one end and closed at the other if side at one end >2.5% of perim and the other <2.5% of perim
                 */
                for (var i=0;i<arr.length;i++){
                    arr.breakpoint[i]=undefined;
                    if ((arr.segment[i]/arr.perim)>=0.025 && (arr.segment[(i+arr.length-1)%arr.length]/arr.perim)>=0.025 && arr.angle[i]>=30){
                        temp[temp.length]=i;
                    }
                    else if ((arr.segment[i]/arr.perim)<0.025 && (arr.segment[(i+arr.length-1)%arr.length]/arr.perim)>0.025){
                        temp2[temp2.length]=i;
                    }
                    else if ((arr.segment[i]/arr.perim)>0.025 && (arr.segment[(i+arr.length-1)%arr.length]/arr.perim)<0.025){
                        temp2[temp2.length]=-i;
                    }
                    else if ((arr.segment[i]/arr.perim)==0.025 || (arr.segment[(i+arr.length-1)%arr.length]/arr.perim)==0.025){
                        temp2[temp2.length]=((temp2[temp2.length-1]>0)?(-i):i)
                        
                    }
                }
                
                /*
                 * if an arc has diverted more than 60 deg, consider as a breakpoint
                 * else consider as an arc in between a continuous line segment
                 */
                for (var i=((temp2[0]>=0)?0:1);i<((temp2[0]>=0)?temp2.length:(temp2.length+1));i+=2){
                    if (temp2.length==0) break;
                    totalAngle=0;
                    for (var j=temp2[i];j<=Math.abs(-temp2[i+1]);j++){
                        totalAngle+=arr.angle[j];
                    }
                    
                    if (totalAngle<60) {
                        temp2=temp2.slice(0,i).concat(temp2.slice(i+2,temp2.length));
                        i-=2;
                    }
                }
                
                for (var i=0;i<temp2.length;i++){
                    x=Number(arr.coord[Math.abs(temp2[i])].split(",")[0]);
                    y=Number(arr.coord[Math.abs(temp2[i])].split(",")[1]);
                };
                
                for (var i=0;i<temp.length;i++){
                    if (temp.length==0) break;
                    i0=temp[(i+temp.length-1)%temp.length];
                    i2=temp[(i+1)%temp.length];
                    for (j=0;j<temp2.length;j++){
                        absTj=Math.abs(temp2[j]);
                        if (temp[i]>i0){
                            if (absTj>i0 && absTj<temp[i]) i0=absTj;
                        }
                        else if (absTj<temp[i] || absTj>i0) i0=absTj;
                        if (temp[i]<i2){
                            if (absTj<i2 && absTj>temp[i]) i2=absTj;
                        }
                        else if (absTj>temp[i] || absTj<i2) i2=absTj;
                    }
                    x0=Number(arr.coord[i0].split(",")[0]);
                    y0=Number(arr.coord[i0].split(",")[1]);
                    x1=Number(arr.coord[temp[i]].split(",")[0]);
                    y1=Number(arr.coord[temp[i]].split(",")[1]);
                    x2=Number(arr.coord[i2].split(",")[0]);
                    y2=Number(arr.coord[i2].split(",")[1]);
                    if (innerAngle(x1-x0,y1-y0,x2-x1,y2-y1)<36){
                        temp=temp.slice(0,i).concat(temp.slice(i+1,temp.length));
                        i--;
                    };
                }
                
                /*
                 * Determine whether breakpoints are at front/street-side lot line.
                 */
                var pTemp=new Point();
                var polyTemp=new Poly();
                var dist1;
                for (var i=0;i<arr.length;i++){
                    color="black"
                    x=Number(arr.coord[i].split(",")[0]);
                    y=Number(arr.coord[i].split(",")[1]);
                    pTemp.setPath(x,y)
                    if (temp.indexOf(i)!=-1 || temp2.indexOf(i)!=-1 || temp2.indexOf(-i)!=-1){
                        for (var j=0;j<lotLine.front.length;j++){
                            pathArray=lotLine.front[j].split(" ");
                            polyTemp.path="";
                            for (var k=0;k<pathArray.length;k++){
                                pathArray[k]=[(Number(pathArray[k].split(",")[0])-minX)/scale,(Number(pathArray[k].split(",")[1])-minY)/scale];//TBC
                                polyTemp.path+=pathArray[k][0]+","+pathArray[k][1]+" "
                                //pathArray[k]=[Number(pathArray[k].split(",")[0]),Number(pathArray[k].split(",")[1])];//TBC
                            };
                            polyTemp.path=polyTemp.path.substr(0,polyTemp.path.length-1);
                            dist=pTemp.distanceTo(polyTemp);
                            if (dist<0.5/scale) {
                                color="red";
                                //svg.polyline(pathArray,{fill:'none',stroke:'red',class:"test"})
                                break;
                            }
                            //svg.polyline(pathArray,{fill:'none',stroke:'red'})
                        };
                       
                        if (color!="red"){
                            for (var j=0;j<lotLine.streetSide.length;j++){
                                pathArray=lotLine.streetSide[j].split(" ");
                                polyTemp.path="";
                                for (var k=0;k<pathArray.length;k++){
                                    pathArray[k]=[(Number(pathArray[k].split(",")[0])-minX)/scale,(Number(pathArray[k].split(",")[1])-minY)/scale];//TBC
                                    polyTemp.path+=pathArray[k][0]+","+pathArray[k][1]+" "
                                    //pathArray[k]=[Number(pathArray[k].split(",")[0]),Number(pathArray[k].split(",")[1])];//TBC
                                };
                                polyTemp.path=polyTemp.path.substr(0,polyTemp.path.length-1);
                                dist=pTemp.distanceTo(polyTemp);
                                if (dist<0.5/scale) {
                                    color="green";break;
                                }
                            }
                        }
                        
                        /*definition of breakpoint values:
                         * proximity - 0:none,1:front lot line,2:side lot line
                         * openness - 0:none,1:open to counter-clockwise,2:open to clockwise
                         */
                        if (temp.indexOf(i)!=-1){
                            arr.breakpoint[i]={proximity:(color=='black')?0:((color=='red')?1:2),openness:0};
                        }
                        else if (temp2.indexOf(i)!=-1 && (Math.abs(i)>0)||(i==0 && temp2[1]<0)){
                            //svg.circle(x,y,5,{stroke:color,strokeWidth:2,fill:'white'})//TBD
                            arr.breakpoint[i]={proximity:(color=='black')?0:((color=='red')?1:2),openness:1};
                        }
                        else{
                            //svg.circle(x,y,5,{stroke:color,strokeWidth:1,fill:'white'})//TBD
                            arr.breakpoint[i]={proximity:(color=='black')?0:((color=='red')?1:2),openness:2};
                        }
                    }
                    
                }
            }//end of generateBreakpoint
            
            /* Calculate lot width and lot depth
             * Lot Depth = Shortest distance from front lot line to rear lot line
             * Lot Width = Average distance from one end of left side lot line to one end of right side lot line.
             */
            var determineLotWidth=function(which){
                var temp,temp2;
                var p1,p2,p3,p4;

                p1=new Point();p2=new Point();p3=new Point();p4=new Point();

                if (which.lotLine.streetSide.path==""){
                    temp=which.lotLine.leftSide.toArray();
                    temp2=which.lotLine.rightSide.toArray();
                }
                else if ( which.lotLine.leftSide.path=="" && which.lotLine.rightSide.path=="" ){
                    return;
                }
                else if (which.lotLine.leftSide.path==""){
                    temp=which.lotLine.streetSide.toArray();
                    temp2=which.lotLine.rightSide.toArray();
                }
                else if (which.lotLine.rightSide.path==""){
                    temp=which.lotLine.streetSide.toArray();
                    temp2=which.lotLine.leftSide.toArray();
                };

                p1.setPath(temp[0]);
                p2.setPath(temp[temp.length-1]);
                p3.setPath(temp2[0]);
                p4.setPath(temp2[temp2.length-1]);

                return (Math.min(p1.distanceTo(p3),p1.distanceTo(p4))+Math.min(p2.distanceTo(p3),p2.distanceTo(p4)))/2
            }
            
            /*
             * Generate separate lot lines based on breakpoint info.
             */
            var generateLotLine=function(){
                var lotLineCode;
                var cachedCoord;
                var switchOn={
                    whole:undefined,
                    front:undefined,
                    streetSide:undefined,
                    leftSide:undefined,
                    rightSide:undefined,
                    rear:undefined
                };
                for (var i=0;i<arr.length;i++){
                    
                    if (arr.breakpoint[i]){
                        if (!isNaN(startPoint) && isNaN(nextPoint)) nextPoint=i;
                        if (isNaN(startPoint) && arr.breakpoint[i].proximity==1){
                            startPoint=i;
                        }
                        if (!isNaN(startPoint) && !isNaN(nextPoint) && arr.breakpoint[nextPoint].proximity!=1){
                            //nextPoint=startPoint=undefined;
                        }
                    }
                }
                for (var i=startPoint;i<startPoint+arr.length;i++){
                    if (arr.breakpoint[i%arr.length]){
                        for (var j=(i+1)%arr.length;j<=i%arr.length+arr.length;j++){
                            if (arr.breakpoint[j%arr.length]) break;
                        }

                        for (var k=(i-1+arr.length)%arr.length+arr.length;k>=(i+arr.length)%arr.length;k--){
                            if (arr.breakpoint[k%arr.length]) break;
                        }
                        lotLineCode=(arr.breakpoint[i%arr.length].openness==2)?"x":" "
                        lotLineCode+=arr.breakpoint[k%arr.length].proximity.toString()+arr.breakpoint[i%arr.length].proximity.toString()+arr.breakpoint[j%arr.length].proximity.toString();
                        lotLineCode+=(arr.breakpoint[i%arr.length].openness==1)?"x":" "
                        lotLinePath.whole+=arr.coord[i%arr.length]+" ";
                        if (arr.breakpoint[i%arr.length].openness==0) switchOn.whole=true
                        else switchOn.whole=false;
                        stbkTemp[stbkTemp.length]=[undefined,undefined];
                        stbkTemp[stbkTemp.length-1][0]=identifyStbk(lotLineCode.substr(1,2),stbkTemp[stbkTemp.length-1][0]);
                        stbkTemp[stbkTemp.length-1][1]=identifyStbk(lotLineCode.substr(2,2));
                    }
                    else {
                        if (lotLineCode[4]=="x") lotLineCode="x"+lotLineCode.substr(1,5)
                        if (switchOn.whole) {
                            stbkTemp[stbkTemp.length]=[undefined,undefined];
                            lotLinePath.whole+=arr.coord[i%arr.length]+" ";
                            stbkTemp[stbkTemp.length-1][0]=stbkTemp[stbkTemp.length-1][1]=identifyStbk(lotLineCode.substr(2,2));
                        }
                    }
                    if (lotLineCode[4]==" "){
                        identifyLotLine(lotLineCode.substr(2,2),i%arr.length,1)
                    }
                    if (lotLineCode[0]==" " && arr.breakpoint[i%arr.length]){
                        if (i==startPoint) cachedCoord=lotLineCode.substr(1,2)
                        else {
                            identifyLotLine(lotLineCode.substr(1,2),i%arr.length,0)
                        }
                        
                    }
                }
                identifyLotLine(cachedCoord,startPoint,0);
            }
            
            /* Generate setback info.
             * 
             */
            var generateSTBK=function(which){
                var stbkTemp2=[];
                for (var i=0;i<stbkTemp.length;i++){
                    stbkTemp2[stbkTemp2.length]=stbkTemp[i][0];
                    stbkTemp2[stbkTemp2.length]=stbkTemp[i][1];
                }
                for (var i=0;i<stbkTemp2.length;i++){
                    if ((stbkTemp2.indexOf("street"))!=-1){
                        if (stbkTemp2[i]=="side1") stbkTemp2[i]="side2"
                    };
                    switch (stbkTemp2[i]){
                        case "front":stbkTemp2[i]=DGL.stbk.front();break;
                        case "street":stbkTemp2[i]=DGL.stbk.street(which.lotWidth);break;
                        case "side1":stbkTemp2[i]=DGL.stbk.side1(which.lotWidth);break;
                        case "side2":stbkTemp2[i]=DGL.stbk.side2();break;
                        case "rear":{
                            stbkTemp2[i]=DGL.stbk.rear(which.lotDepth);
                        }break;
                    }
                }
                for (var i=0;i<stbkTemp2.length;i+=2){
                    stbkTemp[i/2]=[stbkTemp2[i],stbkTemp2[i+1]]
                }
            }
            
            var determineStrLot=function(){
                for (var i=startPoint;i<startPoint+arr.length;i++){
                    if (arr.breakpoint[i%arr.length]){
                        if (arr.breakpoint[i%arr.length].proximity==2) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            var getOrientation=function(which){
                if (!(which instanceof Poly)) return false;
                var temp=which.toArray();
                if (temp.length==0) return 0;
                return innerAngle(1,0,temp[temp.length-1][0]-temp[0][0],temp[temp.length-1][1]-temp[0][1]);
            };
            //end of functions

            this.shape=new Poly();
            this.shape.setPath(convertToScale().substr(0,convertToScale().length-1))
            this.shape.close();
            //console.log(svg.polygon(this.shape.toArray()))
            temp=this.shape.toArray();
            projStyle.x=(temp[0][0]+temp[2][0])/2;
            projStyle.y=(temp[0][1]+temp[2][1])/2;
            projStyle.z=0;
            temp=[];
            
            arr={
                coord:list(this.shape,"coord"),
                angle:list(this.shape,"angle"),
                segment:list(this.shape,"length"),
                perim:this.shape.perim(),
                length:list(this.shape,"coord").length,
                breakpoint:[]
            }
            generateBreakpoint();

            if ((temp.length+temp2.length/2)==4){
                this.irregular=false;
            }
            else {
                alert("The parcel you selected is peculiar! Contact the City to verify allowable building bulk & mass.");
                return "Irregular shape!";
            };

            generateLotLine();
            this.isStrLot=determineStrLot();
            this.lotLine.whole.setPath(lotLinePath.whole.substr(0,lotLinePath.whole.length-1));
            this.lotLine.whole.close();
            this.lotLine.front.setPath(lotLinePath.front.substr(0,lotLinePath.front.length-1));
            this.lotLine.leftSide.setPath(lotLinePath.leftSide.substr(0,lotLinePath.leftSide.length-1));
            this.lotLine.rightSide.setPath(lotLinePath.rightSide.substr(0,lotLinePath.rightSide.length-1));
            this.lotLine.streetSide.setPath(lotLinePath.streetSide.substr(0,lotLinePath.streetSide.length-1));
            this.lotLine.rear.setPath(lotLinePath.rear.substr(0,lotLinePath.rear.length-1));
            this.lotLine.orientation=getOrientation(this.lotLine.front);
            this.lotDepth=Number(this.lotLine.front.distanceTo(this.lotLine.rear).toFixed(0));
            this.lotWidth=determineLotWidth(this); 

            if (!this.lotWidth){
                alert("The parcel you selected is peculiar! Contact the City to verify allowable building bulk & mass.");
                return "Irregular shape!";
            }

            if (this.lotLine.streetSide.path != ""){
                var tempFront=this.lotLine.front.toArray();
                var tempStreet=this.lotLine.streetSide.toArray();
                var tempWhole=this.lotLine.whole.path;
                if (this.lotLine.leftSide!=""){
                    tempWhole=tempWhole.split(tempFront[tempFront.length-1][0]+","+tempFront[tempFront.length-1][1])[1];
                    tempWhole=tempWhole.split(tempStreet[0][0]+","+tempStreet[0][1])[0];
                }
                else {
                    console.log(tempWhole,tempStreet[tempStreet.length-1])
                    tempWhole=tempWhole.split(tempStreet[tempStreet.length-1][0]+","+tempStreet[tempStreet.length-1][1])[1];
                }
            }
            //this.lotLine.street.setPath(this.lotLine.front.path+tempWhole.path.substr(tempWhole.search(tempFront[tempFront]))+this.lotLine.street.path)
            
            
            generateSTBK(this);
            this.PBA=this.lotLine.whole.offsetByPoint(stbkTemp);
            this.generateBldg(DGL,this);
            /*
             * Generate Building Area
             */
            
        }
        $("#Area_Lot").html(this.shape.area().toFixed(0)+" sf");
        $("#Area_PBA").html(this.PBA.area().toFixed(0)+" sf");
        $("#Area_Floor").html(DGL.area.total(this.shape.area()).toFixed(0)+" sf");
        $("#Lot_Width").html(Math.round(this.lotWidth)+"'");
        $("#Lot_Depth").html(Math.round(this.lotDepth)+"'");
        geoLib.project(svg,projStyle,svgMain);

        setTimeout('$("body").css("cursor","auto")',10);
        $("#BH_Parcels").fadeOut(1000);
        setTimeout("$('#Main').fadeIn(1000)",500);
        $("#Menu td.tier1").attr('isSelected','false');
        $("#VisualMode").attr('isSelected','true');

        $("#LeftPanel div.note").hide()
        $("#Zoning_Reg").show();
        
        var tempSin=Math.sin(projStyle.alpha*Math.PI/180);
        var tempCos=Math.cos(projStyle.alpha*Math.PI/180);
        $("#Control #Box").show();
        $("#NorthArrow").attr("transform","matrix("+tempCos+" "+(-tempSin)+" "+tempSin+" "+tempCos+" "+(70-60*tempSin+7.656*tempSin-7.2217*tempCos)+" "+(70-60*tempCos+7.656*tempCos+7.2217*tempSin)+")")
        $("#Control").attr("transform","matrix(1 0 0 "+Math.sin(projStyle.theta*Math.PI/180)+" 620 "+70*(1-Math.sin(projStyle.theta*Math.PI/180))+")");
    }
};