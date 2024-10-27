import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CPUInfo {
  model: string;
  averageUsagePercentage: number;
  temperature: number; // Add temperature field to store CPU package temperature
}

// Function to get CPU model name from lscpu
async function getCPUModel(): Promise<string> {
  try {
    const { stdout: cpuInfo } = await execAsync("lscpu");
    const modelMatch = cpuInfo.match(/Model name:\s+(.*)/);
    return modelMatch ? modelMatch[1].trim() : "Unknown";
  } catch (error) {
    console.error("Error getting CPU model:", error);
    return "Unknown";
  }
}

// Function to get total CPU usage percentage using mpstat
async function getCPUUsagePercentage(): Promise<number> {
  try {
    const { stdout } = await execAsync(
      "mpstat | awk '/all/ {print 100 - $NF}'"
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error("Error getting CPU usage:", error);
    return 0;
  }
}

// Function to get total CPU temperature (Package id 0)
async function getCPUTemperature(): Promise<number> {
  try {
    const { stdout } = await execAsync(
      "sensors 2>/dev/null | awk '/Package id 0/ {gsub(/[^0-9.]/, \"\", $4); print $4}'"
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error("Error getting CPU temperature:", error);
    return 0;
  }
}

export async function getCPUStatus(): Promise<CPUInfo> {
  try {
    const model = await getCPUModel();
    const averageUsagePercentage = await getCPUUsagePercentage();
    const temperature = await getCPUTemperature();

    return {
      model,
      averageUsagePercentage,
      temperature,
    };
  } catch (error) {
    console.error("Error getting CPU status:", error);
    return { model: "Unknown", averageUsagePercentage: 0, temperature: 0 };
  }
}
