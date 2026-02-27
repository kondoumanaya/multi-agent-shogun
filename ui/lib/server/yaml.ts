import { promises as fs } from "node:fs";
import yaml from "js-yaml";

export async function readYamlFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = yaml.load(raw);
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function writeYamlFile<T>(filePath: string, data: T): Promise<void> {
  const dumped = yaml.dump(data, {
    noRefs: true,
    lineWidth: 120,
    sortKeys: false
  });
  await fs.writeFile(filePath, dumped, "utf8");
}

export async function readTextFile(filePath: string, fallback = ""): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}
