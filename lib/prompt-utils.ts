/**
 * Utilities for extracting and selecting prompts for image generation
 */

export interface Draft {
  id: string;
  structured?: {
    image_prompt?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Extract all available image prompts from drafts
 */
export function extractImagePrompts(drafts: Draft[]): string[] {
  return drafts
    .map((d) => d.structured?.image_prompt)
    .filter((p): p is string => !!p && typeof p === "string" && p.trim().length > 0);
}

/**
 * Get a random element from an array
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get N unique random elements from an array
 */
function getUniqueRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Hybrid prompt selection: 1 random + let user pick from available options
 * Returns [randomPrompt] for initial generation, plus list of all prompts for user to select from
 */
export function getInitialHybridSelection(
  allPrompts: string[]
): {
  initialPrompts: string[];
  availableForSelection: string[];
  randomPrompt: string;
} {
  if (allPrompts.length === 0) {
    return {
      initialPrompts: [],
      availableForSelection: [],
      randomPrompt: "",
    };
  }

  const randomPrompt = getRandomElement(allPrompts);
  const availableForSelection = allPrompts.filter((p) => p !== randomPrompt);

  return {
    initialPrompts: [randomPrompt],
    availableForSelection,
    randomPrompt,
  };
}

/**
 * Generate final prompts list: 1 random + up to 2 user-selected
 */
export function generateFinalPrompts(
  randomPrompt: string,
  userSelectedPrompts: string[]
): string[] {
  const final = [randomPrompt];

  // Add up to 2 more from user selection
  const additionalPrompts = userSelectedPrompts.slice(0, 2);
  final.push(...additionalPrompts);

  return final;
}

/**
 * Generate 3 random prompts (simple approach for MVP)
 */
export function getRandomPrompts(allPrompts: string[], count: number = 3): string[] {
  if (allPrompts.length === 0) return [];

  // If we have 3+ prompts, get 3 unique ones
  if (allPrompts.length >= count) {
    return getUniqueRandomElements(allPrompts, count);
  }

  // If we have fewer than 3, return all and pad with random repeats
  const result = [...allPrompts];
  while (result.length < count) {
    result.push(getRandomElement(allPrompts));
  }
  return result;
}
