import { cue } from '../stage/types';
import type { Scene } from '../stage/types';

/**
 * ACT I — THE SÉANCE
 *
 * Costume: seance (candle-lit Victorian parlour theatre).
 * Written for the séance token set. Act II re-tokens the same grammar.
 */
export const seance: Scene = {
  id: 'seance',
  costume: 'seance',
  title: 'The Séance',
  subtitle: 'Act I · The Orpheum, ninety-four years dark',
  entry: 'b01',
  beats: {
    b01: {
      id: 'b01',
      direction: 'a match, struck. the orpheum, ninety-four years dark.',
      text:
        'The flame finds the wick and the wick finds the dark, and the dark admits — for one honest second — that it was only ever a room. Rows of seats. A ceiling painted with a sky somebody once believed in.\n\nThen the match dies, and the room goes back to being a mouth.',
      cue: cue('ember', 0.46, 0.3, 0, 0),
      next: 'b02',
    },
    b02: {
      id: 'b02',
      direction: 'the house speaks. it does not use the air.',
      text:
        '“Third row,” it says. “Not the second. The second is taken.”\n\nYou cannot tell whether the voice is behind you or inside the walls. It has the patient cadence of something that has been waiting a very long time and has stopped being angry about it.',
      cue: cue('hush', 0.24, 0.34, 0.05, -0.2),
      choices: [
        { label: 'Take the third row.', next: 'b03a' },
        { label: 'Ask who is sitting in the second.', next: 'b03b' },
        { label: 'Stay standing in the aisle.', next: 'b03c' },
      ],
    },
    b03a: {
      id: 'b03a',
      direction: 'the third row. the seat is warm.',
      text:
        'You sit. The velvet gives under you the way velvet gives when somebody has only just stood up.\n\nYou do not turn around. Some part of you — the part that has kept you alive this long — has already done the arithmetic on that.',
      cue: cue('hush', 0.3, 0.3, 0.12, 0),
      next: 'b04',
    },
    b03b: {
      id: 'b03b',
      direction: 'the question hangs. then something in the dark exhales.',
      text:
        '“A critic,” the house says. “He came to review the final performance and never filed. He is still deciding what to write.”\n\nA pause with a shape to it.\n\n“He has been deciding for ninety-four years. I would not sit in the second row.”',
      cue: cue('dread', 0.26, 0.42, 0.18, 0.25),
      next: 'b04',
    },
    b03c: {
      id: 'b03c',
      direction: 'you do not move. the aisle holds you like a held breath.',
      text:
        '“Standing,” the house says, and there is something in it that is almost fond. “Good. The ones who sit down first never last the whole act.”\n\nSomewhere above you, a rope takes up its slack.',
      cue: cue('ember', 0.34, 0.3, 0.08, 0),
      next: 'b04',
    },
    b04: {
      id: 'b04',
      direction: 'a single bulb on a brass stand. it has been burning for ninety-four years.',
      text:
        'It is the only light in the building. Nobody has changed the bulb. Nobody has paid the electricity. It burns anyway, the way a lie burns — steadily, and a little too warm.\n\nThe ghost light. The one that stays on so the dead can still find the stage.',
      cue: cue('ember', 0.62, 0.26, 0.2, 0),
      next: 'b05',
    },
    b05: {
      id: 'b05',
      direction: 'the house leans in.',
      text: '“Now,” it says. “Name it.”\n\nThe whole theatre is waiting, and you understand, with a coldness that arrives all at once, that this is the part of the evening where you are supposed to be brave.',
      cue: cue('ember', 0.7, 0.34, 0.34, 0),
      choices: [
        { label: 'A person. Somebody I lost.', next: 'b06a' },
        { label: 'A place that no longer exists.', next: 'b06b' },
        { label: 'A version of myself I buried.', next: 'b06c' },
        { label: 'Nothing. Nothing at all.', next: 'b06d' },
      ],
    },
    b06a: {
      id: 'b06a',
      direction: 'the light warms. something in row nine turns its head.',
      text:
        'The bulb swells — not brighter, *fuller*, as though it has finally been given permission.\n\nIn the ninth row, a shape that was not there a moment ago adjusts its coat. You know the coat. You would know the coat anywhere.\n\n“Say their name correctly,” the house murmurs. “They are very particular about that.”',
      cue: cue('rise', 0.82, 0.44, 0.46, 0.1),
      next: 'b07',
    },
    b06b: {
      id: 'b06b',
      direction: 'the fog lies down flat. the ceiling becomes a street.',
      text:
        'The painted sky above you unstiffens and becomes a summer evening three decades gone — a shopfront, a river, a lamp post with somebody’s bicycle leaning on it.\n\nIt lasts four seconds. Then the paint remembers it is paint and the pavement drains out of it like water out of a sink.\n\n“It is not gone,” the house says. “It is just finished.”',
      cue: cue('rise', 0.74, 0.6, 0.28, -0.35),
      next: 'b07',
    },
    b06c: {
      id: 'b06c',
      direction: 'the bulb gutters. the light drops to a sick yellow.',
      text:
        'Something steps forward out of the dark and stops at the edge of the pool of light, and even across forty feet you can see that it still has all its teeth, still knows which side of the world to stand on, and has never once been afraid of this room.\n\nYou cannot look at it for very long. It is not cruel. That is the difficult part. It is just very, very tired of you.',
      cue: cue('dread', 0.5, 0.7, 0.36, -0.05),
      next: 'b07',
    },
    b06d: {
      id: 'b06d',
      direction: 'a silence of an entirely different quality.',
      text:
        'For a moment nothing at all happens, and it is the worst moment of the entire night.\n\nThen the house laughs — not unkindly — and something in the rafters begins, quite gently, to applaud. A single pair of hands. Slow. Unstoppable.\n\n“Oh,” it says. “You will do very well.”',
      cue: cue('flicker', 0.44, 0.38, 0.42, 0),
      next: 'b07',
    },
    b07: {
      id: 'b07',
      direction: 'a rope takes up its slack. the curtain rises.',
      text:
        'You did not hear the machinery start. Ninety-four years, and it still runs.\n\nBeyond the proscenium there is no stage. There is no back wall. There is only the auditorium again — the same rows, the same red velvet — carrying on and on into a distance that has no business being there.\n\nEvery seat is full.',
      cue: cue('rise', 0.58, 0.5, 0.9, 0),
      next: 'b08',
    },
    b08: {
      id: 'b08',
      direction: 'they are not watching the stage.',
      text:
        'A hundred and forty heads turn to the third row at once, without a sound.\n\nThey are not watching the stage. They are watching *you*, and they are waiting with the terrible politeness of people who have already paid.',
      cue: cue('dread', 0.66, 0.5, 1, 0),
      next: 'b09',
    },
    b09: {
      id: 'b09',
      direction: 'a chair scrapes on the boards behind the curtain. then another.',
      text:
        '“The house is dark,” it says, “and the house is full. Somebody must stand in the light.”\n\nThe ghost light turns — all on its own — toward the stage door. It is not a question. It is a courtesy notice, that you may now choose how the evening ends.',
      cue: cue('ember', 0.72, 0.44, 0.95, 0),
      choices: [
        { label: 'Perform.', next: 'end_perform' },
        { label: 'Blow out the ghost light.', next: 'end_dark' },
        { label: 'Walk up the aisle and do not look back.', next: 'end_leave' },
      ],
    },
    end_perform: {
      id: 'end_perform',
      direction: 'act one, scene one. the house is full.',
      text:
        'You walk through a wall, and it is not a wall. It is the fourth wall, and everyone here has stepped through it already.\n\nThey perform for you. You perform for them. The curtain comes in at eleven and goes up again at eleven, and nobody has ever explained how time works here, and nobody here has ever needed to.\n\nThe ghost light was never there so the dead could find the stage. It was there so you could find the way on.',
      cue: cue('rise', 0.95, 0.3, 1, 0),
      ending: {
        title: 'The House Is Full',
        note: 'Ending 1 of 3 — You took the light. It takes you back.',
        kicker: 'Every seat is taken',
      },
    },
    end_dark: {
      id: 'end_dark',
      direction: 'you cup the bulb and breathe out.',
      text:
        'The flame bends, and fights, and goes.\n\nThe dark that rushes in is not empty. It is *occupied*. A hundred and forty people, newly blind, all facing one direction, all very quiet.\n\n“Well,” says the house, and there is real admiration in it now. “Somebody finally turned it off.”\n\nIn the black, somebody takes the seat behind you.',
      cue: cue('blackout', 0.02, 0.85, 0, 0, 0.6),
      ending: {
        title: 'House Dark',
        note: 'Ending 2 of 3 — You denied them the light. It is not dark for them.',
        kicker: 'Somebody takes the seat behind you',
      },
    },
    end_leave: {
      id: 'end_leave',
      direction: 'up the aisle. do not look back. do not count the rows.',
      text:
        'There are eleven rows to the back of the house. You counted them on the way in. You counted them again on the way out, twice, and both times there were more.\n\nThe door opens onto the fog and the ticket girl is still standing under the awning, and she does not look at you when she says, “Interval.”\n\nThe ghost light burns on behind you, exactly as it always has. Somebody has to.',
      cue: cue('hush', 0.3, 0.55, 0.15, 0.2),
      ending: {
        title: 'Interval',
        note: 'Ending 3 of 3 — You left. It will still be there, lit, when you come back.',
        kicker: 'The ticket girl says: Interval',
      },
    },
  },
};
