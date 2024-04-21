import { getDefaultLayer } from "../layer.ts";
import { importFiles, PositionList } from "./importXVI.ts";
import { showMultipleFileSelect } from "../filesio/saveManagement/saveManagement.ts";

export async function loadEmbedded(xthSettings: string[]) {
    const defaultLayer = getDefaultLayer();
    if (defaultLayer) defaultLayer.data.therionData.xthSettings = xthSettings;

    const positions: PositionList = [];
    for (const line of xthSettings) {
        if (line.startsWith("##XTHERION## xth_me_image_insert")) {
            const params = line.slice(33).split(" ");
            const x = Number.parseFloat(params[0].slice(1));
            const y = -Number.parseFloat(params[3].slice(1));
            const name = / {*([^{}]+)}* 0 {}/.exec(line)[1];

            positions.push([name, x, y]);
        }
    }
    if (positions.length === 0) return;
    const files = await showMultipleFileSelect(positions.map(e => e[0]));

    importFiles(
        Array.from(files.entries(), ([name, file]) => {
            const pos = positions.find(e => e[0] === name);
            return {
                name,
                file,
                x: pos?.[1] ?? 0,
                y: pos?.[2] ?? 0
            };
        })
    );
}