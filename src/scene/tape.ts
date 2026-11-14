import { cue } from '../stage/types';
import type { Scene } from '../stage/types';

/**
 * ACT II — THE TAPE
 *
 * Same beat graph as the séance. Same cue protocol. Different register entirely:
 * found-footage, camcorder, analog decay. If the costume were cosmetic, this scene
 * could not exist — the words would still be candle-lit.
 */
export const tape: Scene = {
  id: 'tape',
  costume: 'vhs',
  title: 'The Tape',
  subtitle: 'Act II · Orpheum Security, Cassette 11',
  entry: 'b01',
  beats: {
    b01: {
      id: 'b01',
      direction: 'camcorder. night vision. auto-focus hunting. timecode 00:00:04.',
      text:
        'REC. 02:14 AM. The camera is set on a tripod at the back of the room and nobody has touched it in four minutes.\n\nAUDIO: room tone. HVAC. Then, under it, a click. Modem. Wrong to be here. Nobody plugged anything in.',
      cue: cue('hush', 0.18, 0.3, 0, 0),
      next: 'b02',
    },
    b02: {
      id: 'b02',
      direction: 'audio spike. camera does not react. camera is a machine.',
      text:
        '“Third row.” The voice is on the tape. It is not in the room. That is the important thing to understand.\n\n“Second row is taken.”\n\nAUDIO CH1 / CH2: balanced. No reverb. The room has reverb. The voice does not.',
      cue: cue('hush', 0.26, 0.4, 0.06, -0.2),
      choices: [
        { label: 'Sit in the third row.', next: 'b03a' },
        { label: 'Play back the second row.', next: 'b03b' },
        { label: 'Leave the camera running.', next: 'b03c' },
      ],
    },
    b03a: {
      id: 'b03a',
      direction: 'the frame does not change. the frame has been changed.',
      text:
        'TIME 02:16. The camera is unmanned. The tripod is unmanned.\n\nSo the frame is not supposed to have moved. It has moved four inches left, and in the foreground a shoulder of someone in a coat comes into shot, sits, and stays still for the rest of the tape.\n\nYou have not seen that coat since you were nine years old.',
      cue: cue('hush', 0.32, 0.34, 0.14, 0),
      next: 'b04',
    },
    b03b: {
      id: 'b03b',
      direction: 'rewind. artifact. the picture finds something it was told to lose.',
      text:
        'You scan backward and the tape gives up a single frame it had been hiding — a man in row two, holding a notepad, pen down, mid-decision.\n\nThen the picture tears, and the timecode jumps, and it is gone, and the tape is very careful with you about it: it will let you look again tomorrow.',
      cue: cue('dread', 0.28, 0.46, 0.2, 0.25),
      next: 'b04',
    },
    b03c: {
      id: 'b03c',
      direction: 'the camera stays. the camera is very good at staying.',
      text:
        'You do the smart thing. You leave the machine on the tripod and step back into the doorway and let it watch on your behalf.\n\nOn the monitor, the aisle holds still. On the monitor, nothing happens. For eight minutes.\n\nOn the monitor, at 02:22, something moves very close to the lens — and the tripod has not moved, and the lens cannot move itself.',
      cue: cue('ember', 0.36, 0.36, 0.1, 0),
      next: 'b04',
    },
    b04: {
      id: 'b04',
      direction: 'one practical on a brass stand. no power source. no explanation.',
      text:
        'The ghost light is in frame.\n\nAgainst all reason, it is the brightest thing on the tape. Night-vision mode cannot explain it. The gain on the sensor is turned all the way down and it is *still* clipping.\n\nOne bulb. No cable running to it. Burning for ninety-four years on a circuit that was cut in 1932.',
      cue: cue('ember', 0.64, 0.3, 0.22, 0),
      next: 'b05',
    },
    b05: {
      id: 'b05',
      direction: 'the tape advances. nobody is using the tape.',
      text: '“NAME IT.”\n\nThe audio is clipping. The audio is clipping and the tape is not degrading, and you can hear, underneath, the sound of a hundred and forty people leaning forward at once.',
      cue: cue('ember', 0.72, 0.38, 0.36, 0),
      choices: [
        { label: 'A person. Somebody I lost.', next: 'b06a' },
        { label: 'A place that no longer exists.', next: 'b06b' },
        { label: 'A version of myself I buried.', next: 'b06c' },
        { label: 'Nothing. Nothing at all.', next: 'b06d' },
      ],
    },
    b06a: {
      id: 'b06a',
      direction: 'tracking error. the machine corrects it. the machine did not have to.',
      text:
        'The head switches clean and the ninth row resolves.\n\nThere is a figure there, and the figure is in focus, and nothing else in the frame is in focus, and the camcorder has never chosen a focal point in its entire cheap life.\n\nIt turns, very slightly, to make sure the shot is good.',
      cue: cue('rise', 0.84, 0.46, 0.48, 0.1),
      next: 'b07',
    },
    b06b: {
      id: 'b06b',
      direction: 'the tape edits itself into a street.',
      text:
        'Three seconds of a summer evening that is not on any cassette: a shopfront, a river, a lamp post, a bicycle.\n\nThen V-SYNC ROLL — and it is a stage again, and the picture has been nice about it, and the picture is now over.',
      cue: cue('rise', 0.76, 0.62, 0.3, -0.35),
      next: 'b07',
    },
    b06c: {
      id: 'b06c',
      direction: 'exposure drops. the sensor tries to compensate and fails.',
      text:
        'Something crosses the pool of light and the automatic exposure cannot keep up, so for two full seconds the shot is nothing but a white smear and the sound of your own breathing played back a quarter tone too low.\n\nWhen the picture comes back, the thing is closer, and it has your face, and it is looking directly into the lens — which means it is looking at whoever is holding this tape. It has always been looking at whoever is holding this tape.',
      cue: cue('dread', 0.52, 0.72, 0.38, -0.05),
      next: 'b07',
    },
    b06d: {
      id: 'b06d',
      direction: 'no audio. no video. no timecode. then all three. then laughter.',
      text:
        'The tape cuts to blue.\n\nThen white noise.\n\nThen — briefly, and this is the part the camera department will argue about for years — a hundred and forty faces, all laughing, all in perfect sync, and the sound of one person in an empty room starting to clap.',
      cue: cue('flicker', 0.46, 0.4, 0.44, 0),
      next: 'b07',
    },
    b07: {
      id: 'b07',
      direction: 'the rope takes up its slack. the curtain rises on tape.',
      text:
        'The tape does something it has never done: it pans, unprompted, past the proscenium, and the stage is not a stage, and the house comes back around — the same seats, the same velvet — going on in a direction the lens is not supposed to have.\n\nEvery seat is full, and every seat is full of static that is the exact shape of a person.',
      cue: cue('rise', 0.6, 0.52, 0.92, 0),
      next: 'b08',
    },
    b08: {
      id: 'b08',
      direction: 'a hundred and forty faces turn toward the lens.',
      text:
        'They turn together. The sound is not a sound, it is a head-switch misalignment the length of the room.\n\nThey are not watching the stage. They are looking into the camera, and the camera is pointed at you, and you are holding the tape.',
      cue: cue('dread', 0.68, 0.52, 1, 0),
      next: 'b09',
    },
    b09: {
      id: 'b09',
      direction: 'REC blinks. REC has been blinking for ninety-four years.',
      text: '“SOMEBODY MUST STAND IN THE LIGHT.”\n\nThe tape ends here. And then — impossibly, mechanically, without anyone pressing anything — it begins again.',
      cue: cue('ember', 0.74, 0.46, 0.96, 0),
      choices: [
        { label: 'Perform.', next: 'end_perform' },
        { label: 'Blow out the ghost light.', next: 'end_dark' },
        { label: 'Walk up the aisle and do not look back.', next: 'end_leave' },
      ],
    },
    end_perform: {
      id: 'end_perform',
      direction: 'the fourth wall is a camera. you step through it.',
      text:
        'You walk into frame.\n\nThe recording is 94 years long. Every night at eleven the tape rewinds to the beginning and every night the house fills again and every night, on the far side of the glass, somebody very tired presses play.\n\nThey have been watching you the entire time. That was the audition.',
      cue: cue('rise', 0.96, 0.32, 1, 0),
      ending: {
        title: 'You Are the Tape',
        note: 'Ending 1 of 3 — You became the footage. Somebody will find you eventually.',
        kicker: 'Play is pressed on the far side',
      },
    },
    end_dark: {
      id: 'end_dark',
      direction: 'you unplug the practical. the practical had no plug.',
      text:
        'The bulb goes out and the tape goes to a black that is deeper than black, because black on video is never black, it is noise, and this is the absence of noise.\n\nThen, in the silence, from a distance measured in fields of static: one hundred and forty people finding their seats in the dark.',
      cue: cue('blackout', 0.02, 0.88, 0, 0, 0.6),
      ending: {
        title: 'End of Tape',
        note: 'Ending 2 of 3 — You killed the picture. The room did not need it.',
        kicker: 'No signal. No noise. No house.',
      },
    },
    end_leave: {
      id: 'end_leave',
      direction: 'stop. eject. do not rewind.',
      text:
        'You stop the tape and the screen folds into a single white line and the room is just a room again, warm and dusty and ordinary.\n\nThe cassette is warm in your hand. You do not take it with you. You do not put it down either.\n\nYou are already planning to watch it again. You know because you have watched it before.',
      cue: cue('hush', 0.32, 0.58, 0.16, 0.2),
      ending: {
        title: 'Please Rewind',
        note: 'Ending 3 of 3 — You stopped it. The tape is waiting to be played.',
        kicker: 'You have watched this before',
      },
    },
  },
};
