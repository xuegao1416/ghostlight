const {seance}=await import('./src/scene/seance.ts');
const {tape}=await import('./src/scene/tape.ts');
const path=[['seance','b01'],['seance','b02'],['seance','b03b'],['seance','b04'],['seance','b05'],['seance','b06a'],['seance','b07'],['seance','b08'],['seance','b09'],['seance','end_perform'],
            ['tape','b01'],['tape','b02'],['tape','b03b'],['tape','b04'],['tape','b05'],['tape','b06a'],['tape','b07'],['tape','b08'],['tape','b09'],['tape','end_dark']];
const S={seance,tape};
for(const [s,id] of path){
  const b=S[s].beats[id];
  if(!b){console.log('MISSING',s,id);continue;}
  const n=(b.text||'').length;
  console.log(`${s}/${id}`.padEnd(16), String(n).padStart(4), 'chars', (n*46/1000).toFixed(1)+'s', 'aud='+(b.cue?.audience??'-'), 'int='+(b.cue?.intensity??'-'));
}
