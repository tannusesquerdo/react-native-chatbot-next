import { describe, expect, it } from 'vitest';
import { parityFixtures } from '../fixtures';
import { simulateFlow } from '../simulateFlow';

describe('parity fixtures', () => {
  for (const fixture of parityFixtures) {
    it(fixture.name, () => {
      const out = simulateFlow(fixture.steps, fixture.inputs, {
        botDelay: 1,
        userDelay: 1,
        customDelay: 1,
      });

      expect(out.renderedSteps.map((s) => String(s.id))).toEqual(fixture.expected.renderedIds);
      expect(out.values).toEqual(fixture.expected.values);
    });
  }
});
