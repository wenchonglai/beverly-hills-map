/**
 * @author Wenchong Lai
 */
var projStyle={
    x:0,
    y:0,
    z:0,
    alpha:0,
    theta:45,
    xNew:360,
    yNew:280,
    zoom:2
};
var navProjStyle={
    a:.55,
    b:0,
    c:0,
    d:.55,
    e:360,
    f:-170
};
var getClassStyle=function(className){
    switch (className){
        case "V-PRCL":{
            return {fill:"#A6BC7D",class:"V-PRCL"};
        };
        case "V-PRCL-OTLN":{
            return {fill:"none",stroke:"#000000",strokeWidth:2,style:"stroke-dasharray:14,2,2,2",class:"V-PRCL-OTLN"};
        };
        case "V-PBA":{
            return {fill:"none",stroke:"#ff0000",strokeWidth:2,style:"stroke-dasharray:2,2",class:"V-PBA"};//fill="D5D2CC"
        };
        case "A-FLOR":{
            return {fill:'#dfdfdf',stroke:"#000000",strokeWidth:.5,class:"A-FLOR"};
        };
        case "A-ROOF":{
            return {stroke:"#000000",fill:"#CF8C6B",strokeWidth:.5,class:"A-ROOF"};
        };
        case "V-BULK":{
            return {opacity:.3,strokeWidth:1,stroke:"#000000",fill:"none",style:"stroke-dasharray:1,2",class:"V-BULK"};//fill:"#dfefff"
        };
        case "V-SDWK-PED":{
            return {fill:"#d9d3ce",class:"V-SDWK-PED"};
        };
        case "V-SDWK-LSCP":{
            return {fill:"#A6BC7D",class:"V-SDWK-PED"};
        };
    }
};
var drawStyle={
    PRCL:{
        fill:"#A6BC7D",
        stroke:"#000000",
        strokeWidth:2,
        style:"stroke-dasharray:14,2,2,2",
        class:"A-PRCL"
    },
    PBA:{
        fill:"#D5D2CC",
        stroke:"#ff0000",
        strokeWidth:2,
        style:"stroke-dasharray:2,2",
        class:"A-PBA"
    },
    FLOR:{
        fill:'#dfdfdf',
        stroke:"#000000",
        strokeWidth:.5,
        class:"A-FLOR"
    },
    ROOF:{
        stroke:"#000000",
        fill:"#CF8C6B",
        strokeWidth:.5,
        class:"A-ROOF"
    }
}
var pinLocation={
    x:-10000,
    y:-10000
}
