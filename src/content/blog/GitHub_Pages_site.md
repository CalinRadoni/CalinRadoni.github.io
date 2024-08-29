---
title: "Build a GitHub Pages site with simple-purple-theme"
description: "Build a GitHub Pages site using simple-purple-theme as a remote theme"
heroImage: GitHub_Pages_site.png
updatedDate: 2021-04-04
# categories: [ "Web development" ]
pubDate: 2020-06-04
tags: [ "Jekyll", "GitHub Pages", "simple-purple-theme" ]
---

In [Using Jekyll and GitHub Pages](/blog/jekyll_and_github_pages) post I have installed
`Jekyll`, `Ruby` and `Bundler` and created a simple site.

## The Script

To create a custom site, perform the `Jekyll`, `Ruby` and `Bundler` installation then, in an **empty** directory,
execute this script:

```sh
#!/bin/bash
set -e

git clone https://github.com/CalinRadoni/simple-purple-theme.git
cp simple-purple-theme/demo/Gemfile .
cp simple-purple-theme/demo/_config.yml .
cp simple-purple-theme/demo/index.html .
cp simple-purple-theme/demo/example-gitignore .gitignore
mkdir -p assets/img
cp simple-purple-theme/demo/logo.svg assets/img/
cp -r simple-purple-theme/docs/pages .
mkdir -p _posts
rm -rf simple-purple-theme

bundle config set --local path 'vendor/bundle'
bundle install
```

Serve the site with:

```sh
bundle exec jekyll serve
```

and open a browser to [http://127.0.0.1:4000/demo](http://127.0.0.1:4000/demo) to see it.

## Notes

The demo site is served from the `demo` path.
The path is declared in `_config.yml`. To change it:

- **for root path, comment** the line starting with `baseurl:`
- for other path change the value of `baseurl:`

## Update the gems

Go to your site's directory where `Gemfile` is located and execute `bundle update` command.
