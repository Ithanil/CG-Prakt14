"use strict";
function F32ArraySlice(Array,StartEl,StopEl,dN){
	//Gives you every dN-th element in the array, starting from the StartEl-th element
	//until the last requested element before (including) the StopEl-th
	// StartEl, StopEl are expected to be natural numbers (incl. zero), dN must be non-zero integer.
	var itnew,itold;
	var NewArray = new Float32Array(Math.floor((Array.length-StartEl-1)/dN)+1);

	if (dN==0) {
		return NewArray;
	}
	else {
		itnew=0;
		for (itold=StartEl; itold<=StopEl; itold=itold+dN) {
			NewArray[itnew]=Array[itold];
			itnew+=1;
		}
		return NewArray;
	}
}

/* 	Useful functions to operate on arrays (without length argument)	*/

function ArrayMultS(Array,Scalar)
{
	for (var it=0,len=Array.length;it<len;it+=1){
		Array[it]*=Scalar;
	}
}

function ArrayAddS(Array,Scalar)
{
	for (var it=0,len=Array.length;it<len;it+=1){
		Array[it]+=Scalar;
	}
}

function ArrayAddA(Array1,Array2)
{
	for (var it=0,len=Array1.length;it<len;it+=1){
		Array1[it]+=Array2[it];
	}
}

function ArrayDiffA(Array1,Array2)
{
	for (var it=0,len=Array1.length;it<len;it+=1){
		Array1[it]-=Array2[it];
	}
}

function ArraySum(Array)
{
	var sum=0;
	for (var it=0,len=Array.length;it<len;it+=1){
		sum+=Array[it];
	}
	return sum;
}

function ArrayNorm(Array,p)
{
	var norm=0,pinv=1.0/p;
	for (var it=0,len=Array.length;it<len;it+=1){
		norm+=Math.pow(Array[it],p);
	}
	return Math.pow(norm,pinv);
}

function ArraySprod(Array1, Array2)
{
	var sprod=0;
	for (var it=0,len=Array1.length;it<len;it+=1){
		sprod+=Array1[it]*Array2[it];
	}
	return sprod;
}

function ArrayXprod(Array1,Array2)
{
	var xprod=0;
	for (var it=0;it<3;it+=1){
		
	}
}

/*	Useful functions to operate on arrays (with length argument) 	*/

function ArrayMultS_len(Array,Scalar,len)
{
	for (var it=0;it<len;it+=1){
		Array[it]*=Scalar;
	}
}

function ArrayAddS_len(Array,Scalar,len)
{
	for (var it=0;it<len;it+=1){
		Array[it]+=Scalar;
	}
}

function ArrayAddA_len(Array1,Array2,len)
{
	for (var it=0;it<len;it+=1){
		Array1[it]+=Array2[it];
	}
}

function ArrayDiffA_len(Array1,Array2,len)
{
	for (var it=0;it<len;it+=1){
		Array1[it]-=Array2[it];
	}
}

function ArraySum_len(Array,len)
{
	var sum=0;
	for (var it=0;it<len;it+=1){
		sum+=Array[it];
	}
	return sum;
}

function ArrayNorm_len(Array,p,len)
{
	var norm=0,pinv=1.0/p;
	for (var it=0;it<len;it+=1){
		norm+=Math.pow(Array[it],p);
	}
	return Math.pow(norm,pinv);
}

/*																	*/

function RotateVectorList2D(xcoords, ycoords, angle) {
	var it;
	var lenx=xcoords.length;
	var leny=ycoords.length;

	if (lenx!=leny) {
		alert("Error in RotateVectorList2D: Number of xcoords is not equal to the number of ycoords!");
	} else {
		var xhelp,yhelp;
		var cosangl=Math.cos(angle);
		var sinangl=Math.sin(angle);
		for (it=0;it<lenx;it+=1) {
			xhelp=xcoords[it];
			yhelp=ycoords[it];
			xcoords[it] = xhelp * cosangl - yhelp * sinangl;
			ycoords[it] = xhelp * sinangl + yhelp * cosangl;
		}
	}
}
function TranslateVectorList2D(xcoords,ycoords,tX,tY) {
	var lenx=xcoords.length,leny=ycoords.length;

	if (lenx!=leny) {
		alert("Error in TranslateVectorList2D: Number of xcoords is not equal to the number of ycoords!");
	} else {
		ArrayAddS(xcoords,tX);
		ArrayAddS(ycoords,tY);
	}
}

function modulo (divident, divisor) {
    cDivident = '';
    cRest = '';

    for ( var cChar in divident ) {
        cOperator = cRest + '' + cDivident + '' + cChar;

        if ( cOperator < divisor ) {
            cDivident += '' + cChar;
        } else {
            cRest = cOperator % divisor;
            if ( cRest == 0 ) cRest = '';
            cDivident = '';
        }

    }

    return cRest;
}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
