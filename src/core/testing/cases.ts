export interface EquivalenceCase<T> {
  name: string;
  partition: "valid" | "invalid" | "empty" | "unknown" | "malformed";
  value: T;
  expected: "success" | "reject" | "success-or-reject";
}

export interface BoundaryCase {
  name: string;
  value: number;
  position: "below-min" | "min" | "above-min" | "below-max" | "max" | "above-max";
  expected: "valid" | "invalid" | "valid-or-clamped";
}

export function numericBoundaryCases(minimum: number, maximum: number): BoundaryCase[] {
  return [
    { name: "minimum minus one", value: minimum - 1, position: "below-min", expected: "invalid" },
    { name: "minimum", value: minimum, position: "min", expected: "valid" },
    { name: "minimum plus one", value: minimum + 1, position: "above-min", expected: "valid" },
    { name: "maximum minus one", value: maximum - 1, position: "below-max", expected: "valid" },
    { name: "maximum", value: maximum, position: "max", expected: "valid" },
    { name: "maximum plus one", value: maximum + 1, position: "above-max", expected: "valid-or-clamped" },
  ];
}
