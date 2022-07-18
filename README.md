# A web-based Therion map editor
<center>
	<img alt="Screenshot" src="github_assets/window_frame.png">
</center>

Based on [papergrapher](https://github.com/w00dn/papergrapher/), powered by Paper.js

## Usage
Latest stable version is available at https://wtherion.daemonw.com

Latest beta version is available at https://beta.wtherion.daemonw.com

You only need a modern browser to use this app. Chrome is recommended because of its great PWA support.

Feature showcase video: https://www.youtube.com/watch?v=kpogxtt_4TI

For end-user documentation, go to the [wiki on GitHub](https://github.com/daem-on/wtherion/wiki).

### Build status

Stable (GitHub Pages)  
[![Webpack & Deploy](https://github.com/daem-on/wtherion/actions/workflows/deploy.yml/badge.svg)](https://github.com/daem-on/wtherion/actions/workflows/deploy.yml)

Beta (Netlify)  
[![Netlify Status](https://api.netlify.com/api/v1/badges/7d513287-111e-415b-af20-f10deabcc01d/deploy-status)](https://app.netlify.com/sites/roaring-gelato-4ea2f4/deploys)

## Design
Documentation of the code and design decisions will be added once most functionality is finished.

Since this app is based on a vector graphics editor, there is still some functionality that doesn't need to exist in this cave drawing app but remains from the original version.

## Development and building
Use `yarn` and `yarn serve` to run for development. Use `yarn build` or look at the GitHub action for building.