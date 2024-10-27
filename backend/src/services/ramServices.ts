import si from "systeminformation";

interface RAMInfo {
  totalMemory: string;
  freeMemory: string;
  usedMemory: string;
  cachedMemory: string;
  usagePercentage: number;
}

export async function getRAMStatus(): Promise<RAMInfo> {
  try {
    const mem = await si.mem();

    const totalMemory = mem.total;
    const freeMemory = mem.free;
    const usedMemory = mem.active; // Active memory can be used as a proxy for used memory
    const cachedMemory = mem.buffcache; // Buffer/cache memory
    const usagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

    return {
      totalMemory: formatBytesToG(totalMemory),
      freeMemory: formatBytesToG(freeMemory),
      usedMemory: formatBytesToG(usedMemory),
      cachedMemory: formatBytesToG(cachedMemory),
      usagePercentage: parseFloat(usagePercentage),
    };
  } catch (error) {
    console.error("Error getting RAM status:", error);
    return {
      totalMemory: "Unknown",
      freeMemory: "Unknown",
      usedMemory: "Unknown",
      cachedMemory: "Unknown",
      usagePercentage: 0,
    };
  }
}

// Helper function to format bytes into gigabytes with two decimal places
function formatBytesToG(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(2) + " G";
}
