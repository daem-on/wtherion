# A web-based Therion map editor
Based on [papergrapher](https://github.com/w00dn/papergrapher/), powered by Paper.js

## Demo
An automatically built version is available at https://daem-on.github.io/wtherion .

Feature showcase video: https://www.youtube.com/watch?v=kpogxtt_4TI

## Design
Documentation of the code and design decisions will be added once most functionality is finished.

Since this app is based on a vector graphics editor, there is still some functionality that doesn't need to exist in this cave drawing app but remains from the original version.

### Problems with web-based editors
While there are many benefits of having this editor be web-based, there is a significant problem with file handling and having no access to the filesystem. There are many possible solutions:
- Supporting Chromium browsers only and using the File System Access API
- Abandoning the web and making an Electron app
- Providing small file watchers and copiers for users to run in their downloads folder
- Making a WebAssembly version of Therion and running it in the browser

None of these are ideal, and for now I'm keeping the file handling as-is. Users can turn on the browser prompt for where to save downloaded files and it should speed up the workflow of saving and overwriting TH2 files.

## Development and building
Use `yarn` and `yarn serve` to run for development. Use `yarn build` or look at the GitHub action for building.