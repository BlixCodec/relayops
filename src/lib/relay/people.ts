// Small people registry — deterministic Pravatar portraits keyed by name.
// Falls back to initials in the Avatar component when no entry matches.

export interface Person {
  name: string;
  role: string;
  seed: string;
}

export const people: Person[] = [
  { name: "Alicia Monroe", role: "Sr. Dispatcher", seed: "alicia-monroe-42" },
  { name: "Renata Voss", role: "Regional Operations Manager", seed: "renata-voss-17" },
  { name: "Jordan Fields", role: "Dispatcher", seed: "jordan-fields-88" },
  { name: "Marcus Reyes", role: "Refrigeration Tech", seed: "marcus-reyes-31" },
  { name: "Dana Whitfield", role: "Refrigeration Tech", seed: "dana-whitfield-55" },
  { name: "Priya Anand", role: "Boiler / Plumbing Tech", seed: "priya-anand-9" },
  { name: "Sam Okafor", role: "Electrical Tech", seed: "sam-okafor-24" },
  { name: "Lena Kowalski", role: "Compressor Specialist", seed: "lena-kowalski-63" },
];

const byName = new Map(people.map((p) => [p.name.toLowerCase(), p]));

export function personByName(name?: string): Person | undefined {
  if (!name) return undefined;
  return byName.get(name.toLowerCase());
}

export function portraitUrl(name?: string, size = 64): string | undefined {
  const p = personByName(name);
  if (!p) return undefined;
  return `https://i.pravatar.cc/${size * 2}?u=${p.seed}`;
}

export function roleFor(name?: string): string | undefined {
  return personByName(name)?.role;
}
