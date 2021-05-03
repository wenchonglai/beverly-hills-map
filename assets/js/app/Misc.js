/**
 * @author Wenchong Lai
 */
var peculiar=["160.475,368.99 141.895,372.781 141.01,368.293 145.231,367.379 151.17,356.627 157.346,360.386 158.092,361.062 158.74,361.836 159.276,362.691 159.684,363.613 159.959,364.582 160.475,368.99",
"107.268,340.769 91.77,345.594 89.239,336.707 95.25,332.359 96.147,331.9 97.102,331.572 98.092,331.379 99.1,331.326 100.106,331.414 101.09,331.64 102.033,332.004 102.914,332.492 103.721,333.097 104.432,333.812 105.041,334.619 105.531,335.5 107.268,340.769",
"-98.039,419.359 -102.644,401.203 -87.281,401.812 -86.982,401.859 -86.691,401.945 -86.422,402.074 -86.168,402.236 -85.939,402.433 -85.742,402.66 -85.576,402.914 -85.449,403.185 -85.361,403.472 -85.312,403.771 -85.306,404.074 -85.344,404.375 -85.42,404.664 -85.537,404.941 -85.693,405.201 -98.039,419.359",
"136.422,353.965 117.801,358.715 113.875,345.049 113.834,344.754 113.834,344.451 113.875,344.152 113.959,343.863 114.08,343.586 114.24,343.332 114.434,343.101 114.66,342.898 114.908,342.728 115.182,342.597 115.465,342.506 115.762,342.453 116.067,342.445 116.365,342.472 135.334,348.976 136.422,353.965",
"-118.666,473.179 -119.779,473.761 -121.801,477.14 -125.715,480.927 -125.961,480.625 -130.197,483.939 -133.465,479.955 -129.177,476.113 -129.51,475.738 -123.746,471.019 -122.959,471.965 -120.89,470.25 -118.666,473.179",
"-192.416,842.156 -197.027,836.531 -194.631,834.566 -193.441,836.017 -187.367,831.049 -180.299,839.679 -188.773,846.617 -192.416,842.156",
"-94.271,997.699 -94.291,1002.019 -103.47,1001.972 -103.449,997.654 -94.271,997.699",
"-50.07,772.431 -47.445,775.648 -47.379,775.783 -47.355,775.853 -47.332,776.006 -47.34,776.156 -47.379,776.299 -47.408,776.369 -47.492,776.496 -47.597,776.601 -47.724,776.683 -47.791,776.715 -47.937,776.754 -67.531,776.965 -74.586,777.996 -77.615,774.258 -67.877,772.654 -50.07,772.431",
"-133.056,774.965 -138.574,779.484 -145.875,770.568 -144.48,769.429 -146.308,767.195 -143.572,764.967 -141.752,767.191 -140.357,766.051 -133.056,774.965",
"-262.717,896.57 -262.763,896.59 -262.588,896.369 -262.478,896.17 -262.396,895.959 -262.347,895.738 -262.326,895.513 -262.338,895.291 -262.383,895.066 -262.453,894.855 -262.558,894.652 -262.687,894.469 -262.842,894.301 -263.015,894.16 -263.211,894.043 -263.416,893.955 -263.627,893.894 -263.701,893.851 -263.736,893.828 -263.797,893.767 -263.824,893.732 -263.844,893.697 -263.861,893.656 -252.785,884.586 -249.365,888.763 -255.381,893.691 -262.717,896.57",
"-127.76,770.636 -133.056,774.965 -140.357,766.051 -141.752,767.191 -143.572,764.967 -136.482,759.058 -127.617,769.679 -127.578,769.746 -127.523,769.886 -127.5,770.035 -127.506,770.183 -127.519,770.261 -127.572,770.402 -127.654,770.531",
"-138.574,779.484 -143.967,783.883 -144.105,783.945 -144.177,783.963 -144.252,783.974 -144.363,783.976 -144.511,783.957 -144.582,783.933 -144.717,783.867 -144.779,783.822 -153.664,773.219 -146.308,767.195 -144.48,769.429 -145.875,770.568"]

var scale=0.072; //3.6 pixels=50' --> 72pixels=1000'
var advArray={
    remove:function(a,i,j){
        i=isNaN(i)?0:(i>a.length?a.length:i);
        j=(isNaN(j)||j<i)?i:(j>a.length?a.length:j);
        if ((typeof a != "object") || !a.length) a=[];
        return a.slice(0,(i-1)<0?0:(i-1)).concat(a.slice(j,a.length))
    },
    removebyValue:function(a,val){
        var tempA=[];
        var toAdd;
        if (val.toString()=="") return a
        
        else if (!val.length){
            val=[val];
        }
        for (var i in a){
            toAdd=true;
            for (var j in val){
                if (a[i]===val[j]){
                    toAdd=false;
                }
            }
            if (toAdd) tempA[tempA.length]=a[i];
        }
        return tempA;
    }
};
var list=function(poly,product){
    var dx0,dy0,dx1,dy1,x0,y0,x1,y1,x2,y2,r0,r1;
    var output=[];
    if (!product) product="";
    if (!(poly instanceof Poly)||(typeof product !="string")) return false;
    else if (!poly.path) return false;
    switch (product.toUpperCase()){
        case "ANGLE":{
            for (var i=0;i<(poly.closed?poly.toArray().length:(poly.toArray().length-1));i++){
                x0=poly.toArray()[(i+poly.toArray().length-1)%poly.toArray().length][0];y0=poly.toArray()[(i+poly.toArray().length-1)%poly.toArray().length][1];
                x1=poly.toArray()[i % poly.toArray().length][0];y1=poly.toArray()[i % poly.toArray().length][1];
                x2=poly.toArray()[(i+1) % poly.toArray().length][0];
                y2=poly.toArray()[(i+1) % poly.toArray().length][1];
                output[output.length]=innerAngle(x1-x0,y1-y0,x2-x1,y2-y1);
            }
        };return output;
        case "LENGTH":{
            for (var i=0;i<(poly.closed?poly.toArray().length:(poly.toArray().length-1));i++){
                x1=poly.toArray()[i % poly.toArray().length][0];y1=poly.toArray()[i % poly.toArray().length][1];
                x2=poly.toArray()[(i+1) % poly.toArray().length][0];y2=poly.toArray()[(i+1) % poly.toArray().length][1];
                dx1=x2-x1;dy1=y2-y1;
                r2=Math.sqrt(dx1*dx1+dy1*dy1);
                output[output.length]=r2;
            }
        };return output;
        case "COORD":{};
        case "COORDINATION":{
            for (var i=0;i<poly.toArray().length;i++){
                output[output.length]=poly.toArray()[i][0]+","+poly.toArray()[i][1];
            }
        };return output;
    }
    
}
var getDist=function(x,y,pathArray){
    var x0,x1,a,b,dx0,dx1,dx2,dy0,dy1,dy2,dist;
    dist=Math.min(Math.sqrt(Math.pow(x-pathArray[0][0],2)+Math.pow(y-pathArray[0][1],2)),Math.sqrt(Math.pow(x-pathArray[pathArray.length-1][0],2)+Math.pow(y-pathArray[pathArray.length-1][1],2)));
    for (var k=0;k<pathArray.length-1;k++){
        x0=pathArray[k][0];y0=pathArray[k][1]
        x1=pathArray[k+1][0];y1=pathArray[k+1][1]
        b=x1-x0;a=y1-y0;c=x1*y0-y1*x0;
        dx0=x1-x0;dy0=y1-y0;
        dx1=x-x0;dy1=y-y0;
        dx2=x-x1;dy2=y-y1;
        if ((90-Math.abs(innerAngle(dx1,dy1,dx0,dy0)))*(90-Math.abs(innerAngle(dx2,dy2,dx0,dy0)))<=0){
            if (dist>Math.abs(a*x-b*y+c)/Math.sqrt(a*a+b*b)) dist=Math.abs(a*x-b*y+c)/Math.sqrt(a*a+b*b);
        }
    }
    return dist;
}