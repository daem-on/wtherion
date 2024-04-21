import { createProject } from "./importTH2.ts";
import { loadEmbedded } from "./embedded.ts";
import { clear, setup } from "../undo.ts";

export function importTH2(source: string): void {
    createProject(source, loadEmbedded);
    clear();
    setup();
}