/**
 * @author Wenchong Lai
 */
var generateFloor=function(DGL,area,i,j,w,h){var a=Math.floor((1-DGL.ofst.front.ratio)*w);
    var h1=Math.floor((1-DGL.ofst.side.ratio)*h);
    var d1=DGL.ofst.front.distance;
    var d2=DGL.ofst.side.distance;
    var c=0;
    var d3=0;
    var w1,w2;
    var a1Req,a2Req;
    var aReq=area;
    var dx0,dy0,dx1,dy1;
    w1=(a+d2>w)?(w-a):d2;w2=d2;
    h1=(h1+d1>h)?(h-d1):((a+w1>w-w2)?(h1-d1):h1);
    a=(a+w1>w)?(w-w1):a;
    if (!w || !h || (a<12) || (h1<12)) return [];

    if (aReq*DGL.area.secondFlrRatio/(1+DGL.area.secondFlrRatio)<a*b){
        a1Req=a*b;
    }
    else a1Req=Math.floor(aReq/(1+DGL.area.secondFlrRatio));
    
    if (h>(aReq+d1*(w-a-w1)-w1*h1-w2*(h1+d1))/(w-w1-w2)){//when a 1-story building contained in PBA can exceed maximum required building area
        h=Math.floor((aReq+d1*(w-a-d2)-w1*h1-w2*(h1+d1))/(w-w1-w2))+1;
        h1=Math.floor(h*(1-DGL.ofst.side.ratio));
        h1=(h1+d1>h)?(h-d1):((a+w1>w-w2)?(h1-d1):h1);
    }
    else if (w2<(-a1Req+w*h-d1*(w-a-w1)-w1*(h-h1))/(h-h1-d1)){
        var aTemp;
        var hTemp;
        w2=Math.floor((-a1Req+w*h-d1*(w-a-w1)-w1*(h-h1))/(h-h1-d1));
        w2=Math.floor((w2>(w>36?(2*w/3):(w-12)))?(w>36?(2*w/3):(w-12)):w2);
        w2=(w2<w1?w1:w2);
        aTemp=w*h-d1*(w-a-w1)-w1*(h-h1)-w2*(h-h1-d1);
        //a1Req=w*hTemp-d1*(w-a-w1)-w1*hTemp(ratio)-w2*hTemp*ratio+w2*d1=hTemp(w-w1*ratio-w2*ratio)+w2*d1-d1*(w-a-w1)
        //(w-w1-w2)*hTemp-d1*(w-a-w1)+w1*h1+w2*(d1)+hTemp*ratio*(w1+w2)=a1Req
        //a1Req=w*hTemp-d1*(w-a-d1)-w2*hTemp(1-1+ratio)+w2*d1-w1*hTemp*ratio
        //a1Req=w*hTemp-w2*hTemp*ratio-w1*hTemp*ratio-d1*(w-a-w1)
        hTemp=Math.floor((a1Req+d1*(w-a-w1)-w1*d1)/(w-(w1+w1)*DGL.ofst.side.ratio));
        var H=hTemp;var H1=Math.floor(hTemp*h1/h);
        H1=(H1+d1>H)?(H-d1):((a+w1>w-w2)?(H1-d1):H1);
        if ((w2==Math.floor(2*w/3) || (w-w1-w2)/(h-h1-d1)<(2/3)) && hTemp<h) {
            h=hTemp;
            h1=Math.floor(h*(1-DGL.ofst.side.ratio));
            h1=(h1+d1>h)?(h-d1):((a+w1>w-w2)?(h1-d1):h1);
            w2=Math.floor((-a1Req+w*h-d1*(w-a-w1)-w1*(h-h1))/(h-h1-d1));
            w2=Math.floor((w2>(w>36?(2*w/3):(w-12)))?(w>36?(2*w/3):(w-12)):w2);
            w2=(w2<w1?w1:w2);
            //w2=Math.floor(w/3);
        };
    }
    /*else if (a1Req<(a*b+(w-a-d2)*(b-d1))){
        b=(a1Req-d1*(w-a-d2))/(w-d2);
        b=Math.floor(b*DGL.area.secondFlrRatio);
        c=w-w2;
        d3=Math.floor((a1Req-a*b-(w-a-d2)*(b-d1))/c);
    }*/
    else {
       /* c=Math.floor((a1Req-a*b-(w-a-d2)*(b-d1))/(h-b));
        c=(c>w-w2)?(w-w2):c;
        b=(c<Math.floor(w*0.4))?Math.floor((b*c*(h-b)-b*b*(2*d2-w))/(Math.floor(w*0.4)*(h-b)-b*(2*d2-w))):b;
        d3=(c<Math.floor(w*0.4))?Math.floor(b*(DGL.ofst.side.ratio)/(1-DGL.ofst.side.ratio)):(h-b);
        c=(c<Math.floor(w*0.4))?Math.floor(w*0.4):c;*/
    }
    var a1=[
        [i+w1,j],
        [i+w1+a,j],
        [i+w1+a,j+d1],
        [i+w,j+d1],
        [i+w,j+((d1+h1)>h?h:(d1+h1))],
        [i+w-w2,j+((d1+h1)>h?h:(d1+h1))],
        [i+w-w2,j+h],
        [i,j+h],
        [i,j+h-h1],
        [i+w1,j+h-h1]
    ];
    var aTemp=[];
    for (var k=0;k<a1.length;k++){
        if (a1[k][0]!=a1[(k+1)%a1.length][0] || a1[k][1]!=a1[(k+1)%a1.length][1])
                aTemp[aTemp.length]=a1[k];
    }
    a1=aTemp;
    aTemp=[];
    for (var k=0;k<a1.length;k++){
        dx0=a1[k][0]-a1[(k-1+a1.length)%a1.length][0];dy0=a1[k][1]-a1[(k-1+a1.length)%a1.length][1];
        dx1=a1[k][0]-a1[(k+1)%a1.length][0];dy1=a1[k][1]-a1[(k+1)%a1.length][1];
        if (!(dx0==0 && dx1==0) && !(dy0==0 && dy1==0)){
            aTemp[aTemp.length]=a1[k]
        }
    }
    a1=aTemp;
    a1Req=w*h-d1*(w-a-w1)-w1*(h-h1)-w2*(h-h1-d1);
    /*
     * Generate 2nd Floor Bldg Footprint (Orthogonal)
     */
    var d3,w3,w4,h2,h4;
    d3=0;w3=0;h2=h1;h4=h;w4=0;
    a2Req=((aReq-a1Req)>DGL.area.secondFlrRatio*a1Req)?(DGL.area.secondFlrRatio*a1Req):(aReq-a1Req);
    if (a2Req<=(a*d1+12*(w1+a))) return [a1]
    if (a2Req>=a1Req){
    }
    else if (a>w-w1-w2){
        if (a2Req>w*h-d1*(w-a-w1)-w2*(h-h1-d1)-w1*h){//console.log(1)
            w4=Math.floor((a2Req-(w*h-d1*(w-a-w1)-w2*(h-h1-d1)-w1*h))/h1);
        }
        else {//console.log(2)
            w4=w1;
            h4-=Math.floor((w*h-d1*(w-a-w1)-w2*(h-h1-d1)-w1*h-a2Req)/(w-w1-w2))+1
        }
    }
    else {
        if (a2Req>w*h-d1*(w-w1)-w2*(h-h1-d1)-w1*(h-h1)){//console.log(3)
            d3=d1-Math.floor((a2Req-(w*h-d1*(w-w1)-w2*(h-h1-d1)-w1*(h-h1)))/a);
        }
        else if (a2Req>w*h-d1*(w-w1)-w2*(h-h1-d1)-w1*h){//console.log(4)
            d3=d1;w4=Math.floor((a2Req-(w*h-d1*(w-w1)-w2*(h-h1-d1)-w1*h))/h1)
        }
        else {//console.log(5)
            d3=d1;w4=w1;h4-=Math.floor((w*h-d1*(w-w1)-w2*(h-h1-d1)-w1*h-a2Req)/(w-w1-w2))+1
        }
    }
    //else if ()
    /*
    else if (a2Req>a1Req-d1*a){
        
    }
    else if (a2Req>a1Req-d1*a-w1*h1){
        
    }
    else if ()
     */
    /*else if (a2Req>=a*b+(w-a-d2)*(b-d1)){
        console.log("2")
        d3=Math.floor((a2Req-a*b-(w-a-d2)*(b-d1))/c);
        if (d3<12) {
            d5=DGL.ofst.side.distance;
            d3=Math.floor((a2Req-a*b-(w-a-d2)*(b-d1))/(c-d5));
        }
    }
    else if (a2Req>=a*b){
        console.log("3")
        d4=Math.floor((a2Req-a*b)/(b-d1))+a;
        c=0;
    }*/
    var a2=[
        [i+w1,j+d3],
        [i+w1+a,j+d3],
        [i+w1+a,j+d1],
        [i+w-w3,j+d1],
        [i+w-w3,j+((d1+h2)>h4?h4:(d1+h2))],
        [i+w-w2,j+((d1+h2)>h4?h4:(d1+h2))],
        [i+w-w2,j+h4],
        [i+w4,j+h4],
        [i+w4,j+h4-h1],
        [i+w1,j+h4-h1]
    ];
    
    aTemp=[];
    for (var i=0;i<a2.length;i++){
        if (a2[i][0]!=a2[(i+1)%a2.length][0] || a2[i][1]!=a2[(i+1)%a2.length][1])
                aTemp[aTemp.length]=a2[i];
    }
    a2=aTemp;
    aTemp=[];
    for (var i=0;i<a2.length;i++){
        dx0=a2[i][0]-a2[(i-1+a2.length)%a2.length][0];dy0=a2[i][1]-a2[(i-1+a2.length)%a2.length][1];
        dx1=a2[i][0]-a2[(i+1)%a2.length][0];dy1=a2[i][1]-a2[(i+1)%a2.length][1];
        if (!(dx0==0 && dx1==0) && !(dy0==0 && dy1==0)){
            aTemp[aTemp.length]=a2[i]
        }
    }
    a2=aTemp;
    return [a1,a2];
}
    