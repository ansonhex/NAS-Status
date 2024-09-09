import { readFile } from 'fs/promises'

interface RAMInfo {
  totalMemory: string
  freeMemory: string
  usedMemory: string
  cachedMemory: string
  usagePercentage: number
}

// Helper function to format bytes into gigabytes with two decimal places
function formatBytesToG(bytes: number): string {
  return (bytes / (1024 ** 3)).toFixed(2) + ' G'
}

export async function getRAMStatus(): Promise<RAMInfo> {
  try {
    // Read the /proc/meminfo file to get memory info
    const memInfo = await readFile('/proc/meminfo', 'utf8')
    
    // Parse the required values from meminfo
    const lines = memInfo.split('\n')
    const totalMemLine = lines.find(line => line.startsWith('MemTotal'))
    const freeMemLine = lines.find(line => line.startsWith('MemFree'))
    const availableMemLine = lines.find(line => line.startsWith('MemAvailable'))
    const cachedMemLine = lines.find(line => line.startsWith('Cached'))

    if (!totalMemLine || !freeMemLine || !availableMemLine || !cachedMemLine) {
      throw new Error('Unable to parse memory information')
    }

    // Extract values from the lines and convert them to bytes
    const totalMemory = parseInt(totalMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes
    const freeMemory = parseInt(freeMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes
    const availableMemory = parseInt(availableMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes
    const cachedMemory = parseInt(cachedMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes

    // Used memory is total - available memory
    const usedMemory = totalMemory - availableMemory - cachedMemory;

    // Calculate memory usage percentage based on total memory and available memory
    const usagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

    return {
      totalMemory: formatBytesToG(totalMemory),
      freeMemory: formatBytesToG(freeMemory),
      usedMemory: formatBytesToG(usedMemory),
      cachedMemory: formatBytesToG(cachedMemory),
      usagePercentage: parseFloat(usagePercentage)
    }
  } catch (error) {
    console.error('Error getting RAM status:', error)
    return { 
      totalMemory: 'Unknown', 
      freeMemory: 'Unknown', 
      usedMemory: 'Unknown', 
      cachedMemory: 'Unknown',
      usagePercentage: 0 
    }
  }
}
