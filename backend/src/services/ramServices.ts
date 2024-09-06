import { readFile } from 'fs/promises'

interface RAMInfo {
  totalMemory: string
  freeMemory: string
  usedMemory: string
  usagePercentage: number
}

// Helper function to format bytes into gigabytes with two decimal places
function formatBytesToGB(bytes: number): string {
  return (bytes / (1024 ** 3)).toFixed(2) + ' GB'
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

    if (!totalMemLine || !freeMemLine || !availableMemLine) {
      throw new Error('Unable to parse memory information')
    }

    // Extract values from the lines and convert them to bytes
    const totalMemory = parseInt(totalMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes
    const freeMemory = parseInt(freeMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes
    const availableMemory = parseInt(availableMemLine.split(':')[1].trim().split(' ')[0]) * 1024 // Convert from kB to bytes

    // Calculate used memory
    const usedMemory = totalMemory - availableMemory

    // Calculate memory usage percentage
    const usagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2)

    return {
      totalMemory: formatBytesToGB(totalMemory),
      freeMemory: formatBytesToGB(freeMemory),
      usedMemory: formatBytesToGB(usedMemory),
      usagePercentage: parseFloat(usagePercentage)
    }
  } catch (error) {
    console.error('Error getting RAM status:', error)
    return { 
      totalMemory: 'Unknown', 
      freeMemory: 'Unknown', 
      usedMemory: 'Unknown', 
      usagePercentage: 0 
    }
  }
}
