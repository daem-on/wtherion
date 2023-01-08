# `/js/` directory

This directory contains only legacy code from papergrapher. New code should be written in `/src/` and in TypeScript.

These files use commonJS modules because that was the quickest way to convert them from the original format of no modules, only global variables. Most of these files are either inaccesible or accessed through the `pg` global from `/src/init.ts`.