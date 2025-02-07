import { Tool } from "langchain/tools";

export class SleepTool extends Tool {
  name = "sleep";
  description =
    "Pauses execution for a given number of seconds. Input must be a number in seconds.";

  async _call(arg: string): Promise<string> {
    const seconds = parseFloat(arg);
    if (isNaN(seconds)) {
      throw new Error("Invalid argument; expected a number of seconds.");
    }
    console.log(`Sleeping for ${seconds} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return `Slept for ${seconds} seconds.`;
  }
}
