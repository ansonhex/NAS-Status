import { readFile } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface CPUCore {
  number: number
  usagePercentage: number
}

interface CPUInfo {
  model: string
  cores: number
  coreInfo: CPUCore[]
  averageUsagePercentage: number
  temperature: number  // Add temperature field to store CPU package temperature
}

// Parse /proc/stat line to get CPU usage percentage
function parseStatLine(line: string): number {
  const parts = line.split(' ').filter(Boolean)
  const total = parts.slice(1).reduce((sum, num) => sum + parseInt(num), 0)
  const idle = parseInt(parts[4])
  return parseFloat(((total - idle) / total * 100).toFixed(2))
}

// Function to get total CPU temperature (Package id 0)
async function getCPUTemperature(): Promise<number> {
  try {
    const { stdout } = await execAsync("sensors 2>/dev/null | awk '/Package id 0/ {gsub(/[^0-9.]/, \"\", $4); print $4}'");
    return parseFloat(stdout.trim());  // Return temperature as a number
  } catch (error) {
    console.error('Error getting CPU temperature:', error);
    return 0;  // Return 0 if temperature can't be fetched
  }
}

export async function getCPUStatus(): Promise<CPUInfo> {
  try {
    // Get CPU model and number of cores
    const { stdout: cpuInfo } = await execAsync("lscpu")
    
    // Extract CPU model and core count
    const modelMatch = cpuInfo.match(/Model name:\s+(.*)/)
    const coresMatch = cpuInfo.match(/CPU\(s\):\s+(\d+)/)

    const model = modelMatch ? modelMatch[1].trim() : 'Unknown'
    const cores = coresMatch ? parseInt(coresMatch[1].trim()) : 0

    // Read the /proc/stat file to get CPU usage info
    const statContent = await readFile('/proc/stat', 'utf8')
    const statLines = statContent.split('\n')

    // Parse overall CPU usage (total usage across all cores)
    const overallUsage = parseStatLine(statLines[0])

    // Parse CPU usage for each core
    const coreInfo: CPUCore[] = []
    for (let i = 0; i < cores; i++) {
      const coreLine = statLines.find(line => line.startsWith(`cpu${i}`))
      if (coreLine) {
        coreInfo.push({
          number: i,
          usagePercentage: parseStatLine(coreLine)
        })
      }
    }

    // Get CPU package temperature
    const temperature = await getCPUTemperature()

    return { 
      model, 
      cores, 
      coreInfo, 
      averageUsagePercentage: overallUsage,
      temperature  // Add temperature to the returned CPUInfo object
    }
  } catch (error) {
    console.error('Error getting CPU status:', error)
    return { model: 'Unknown', cores: 0, coreInfo: [], averageUsagePercentage: 0, temperature: 0 }
  }
}
