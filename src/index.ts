import glob from "glob-promise";
import fs from "fs";

import {
  ProjectPojo,
  ProjectSetPojo,
  City,
} from "./project";

(async function run() {
  const files = await glob("sets/*.json");
  await Promise.all(files.map(async (file) => {
    const rawContents = await fs.promises.readFile(file, 'utf8');
    const projectSet: ProjectSetPojo = JSON.parse(rawContents);

  }));
})();
