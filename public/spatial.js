// Pure placement math; no device-following updates after placement.
export function placementFromViewer(position,orientation,distance=1.5){
 const {x,y,z,w}=orientation;
 let fx=-2*(x*z+w*y),fz=-(1-2*(x*x+y*y));
 const length=Math.hypot(fx,fz);
 if(length<.05){fx=0;fz=-1;}else{fx/=length;fz/=length;}
 const yaw=Math.atan2(-fx,-fz);
 return {position:{x:position.x+fx*distance,y:position.y-.08,z:position.z+fz*distance},orientation:{x:0,y:Math.sin(yaw/2),z:0,w:Math.cos(yaw/2)}};
}
