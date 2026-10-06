export interface VolumeProfileBin {
  /** Stable identity for this price range across data updates. */
  id: string;
  priceLow: number;
  priceHigh: number;
  /** Executed volume in this range, in the consumer's chosen unit. */
  volume: number;
}

export function buildVolumeProfile(data: readonly VolumeProfileBin[], target: number | false) {
  if (target !== false && (!Number.isFinite(target) || target <= 0 || target > 1))
    throw new Error("VolumeProfile: valueArea must be a fraction above 0 and at most 1, or false.");
  const bins = [...data].sort((a, b) => a.priceLow - b.priceLow);
  const ids = new Set<string>();
  let totalVolume = 0;
  let maxVolume = 0;
  let pocIndex = -1;
  for (const [index, bin] of bins.entries()) {
    if (ids.has(bin.id)) throw new Error(`VolumeProfile: duplicate bin ID "${bin.id}".`);
    ids.add(bin.id);
    if (
      !Number.isFinite(bin.priceLow) ||
      !Number.isFinite(bin.priceHigh) ||
      bin.priceHigh <= bin.priceLow ||
      !Number.isFinite(bin.volume) ||
      bin.volume < 0
    )
      throw new Error(
        "VolumeProfile: bins need finite increasing price bounds and nonnegative volume.",
      );
    if (index > 0 && bin.priceLow < bins[index - 1].priceHigh)
      throw new Error("VolumeProfile: price ranges must not overlap.");
    totalVolume += bin.volume;
    // Equal maxima keep the lower-price bin as a deterministic POC.
    if (bin.volume > maxVolume) {
      maxVolume = bin.volume;
      pocIndex = index;
    }
  }
  const priceLow = bins[0]?.priceLow ?? 0;
  const priceHigh = bins.at(-1)?.priceHigh ?? 1;
  const span = priceHigh - priceLow;
  if (!Number.isFinite(totalVolume) || !Number.isFinite(span))
    throw new Error("VolumeProfile: the total volume and price span must remain finite.");
  let lowIndex = pocIndex;
  let highIndex = pocIndex;
  let areaVolume = pocIndex >= 0 ? bins[pocIndex].volume : 0;
  if (target === 1 && pocIndex >= 0) {
    // A 100% target includes every bin, including empty edge bins, without
    // depending on floating-point summation order during adjacent expansion.
    lowIndex = 0;
    highIndex = bins.length - 1;
    areaVolume = totalVolume;
  } else if (target !== false && pocIndex >= 0) {
    const targetVolume = totalVolume * target;
    // Grow a contiguous area from the POC using the larger adjacent volume.
    // Ties favor the nearer row, then the higher price. Stop before adding a
    // row that would exceed the target; the POC itself is always included.
    while (areaVolume < targetVolume) {
      const below = bins[lowIndex - 1];
      const above = bins[highIndex + 1];
      if (!below && !above) break;
      const takeAbove =
        !below ||
        (!!above &&
          (above.volume > below.volume ||
            (above.volume === below.volume &&
              highIndex + 1 - pocIndex <= pocIndex - (lowIndex - 1))));
      const next = takeAbove ? above : below;
      if (!next || areaVolume + next.volume > targetVolume) break;
      areaVolume += next.volume;
      if (takeAbove) highIndex++;
      else lowIndex--;
    }
  }
  const valueArea =
    target !== false && pocIndex >= 0
      ? {
          priceLow: bins[lowIndex].priceLow,
          priceHigh: bins[highIndex].priceHigh,
          volume: areaVolume,
          share: areaVolume / totalVolume,
          target,
        }
      : null;
  const rows = bins.map((bin, index) => ({
    ...bin,
    price: bin.priceLow + (bin.priceHigh - bin.priceLow) / 2,
    top: (priceHigh - bin.priceHigh) / span,
    height: (bin.priceHigh - bin.priceLow) / span,
    center: (priceHigh - (bin.priceLow + (bin.priceHigh - bin.priceLow) / 2)) / span,
    proportion: maxVolume ? bin.volume / maxVolume : 0,
    share: totalVolume ? bin.volume / totalVolume : 0,
    isPoc: index === pocIndex,
    inValueArea: valueArea !== null && index >= lowIndex && index <= highIndex,
  }));
  return {
    rows,
    poc: rows[pocIndex] ?? null,
    valueArea,
    totalVolume,
    maxVolume,
    priceLow,
    priceHigh,
  };
}

export type VolumeProfileRow = ReturnType<typeof buildVolumeProfile>["rows"][number];
