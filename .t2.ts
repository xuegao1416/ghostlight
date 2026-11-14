const {seance}=await import('./src/scene/seance.ts');
const {text, ...rest}=seance.beats.b01;
console.log(JSON.stringify(rest,null,2));
