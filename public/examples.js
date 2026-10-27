// Modern snippets ready to be possessed during a demo.
export const EXAMPLES = [
  {
    id: 'fetch',
    label: 'JavaScript · fetch',
    lang: 'javascript',
    code: `async function getGhosts() {
  const res = await fetch('https://api.example.com/ghosts');
  const ghosts = await res.json();
  return ghosts.filter((g) => g.haunting).map((g) => g.name);
}`,
  },
  {
    id: 'average',
    label: 'Python · moyenne / average',
    lang: 'python',
    code: `candles = [12, 7, 31, 4]
average = sum(candles) / len(candles)
print(f"Average candle height: {average:.1f} cm")
tall = [c for c in candles if c > average]
print("Tall candles:", tall)`,
  },
  {
    id: 'interest',
    label: 'JavaScript · intérêts / interest',
    lang: 'javascript',
    code: `function compound(principal, rate, years) {
  let total = principal;
  for (let y = 1; y <= years; y++) {
    total = total * (1 + rate);
    console.log(\`Year \${y}: \${total.toFixed(2)}\`);
  }
  return total;
}
compound(1000, 0.05, 3);`,
  },
];
