[ronnqvi.st](http://ronnqvi.st) is an iOS and OSX developer blog written by David Rönnqvist. 

The content behind the site is available here so that you can

 * Access the material
 * File issues for typos, technical mistakes etc.
 * Play around with locally
 
You may also request articles if you want to. Generally I write once a month and mostly about graphics and animation (2D or 3D) or accessibility. 

This repository is _not_ here to use it's content in a way which violates it's [Creative Commons BY-NC License](http://creativecommons.org/licenses/by-nc/3.0/). (Note that sample code from the articles may be licensed under MIT in which case it will have a separate repository (under this account)).
It is also not here to mirror somewhere else.

------------

# Jekyll-Bootstrap

The quickest way to start and publish your Jekyll powered blog. 100% compatible with GitHub pages

## Usage

For all usage and documentation please see: <http://jekyllbootstrap.com>

## Version

0.2.13 - stable and versioned using [semantic versioning](http://semver.org/).

## Contributing 

This repository tracks 2 projects:

- **Jekyll-Bootstrap Framework.**  
  The framework for which users should clone and build their blog on top of is available in the master branch.
  
  To contribute to the framework please make sure to checkout your branch based on `jb-development`!!
  This is very important as it allows me to accept your pull request without having to publish a public version release.
  
  Small, atomic Features, bugs, etc.   
  Use the `jb-development` branch but note it will likely change fast as pull requests are accepted.   
  Please rebase as often as possible when working.   
  Work on small, atomic features/bugs to avoid upstream commits affecting/breaking your development work.
  
  For Big Features or major API extensions/edits:   
  This is the one case where I'll accept pull-requests based off the master branch.
  This allows you to work in isolation but it means I'll have to manually merge your work into the next public release.
  Translation : it might take a bit longer so please be patient! (but sincerely thank you).
 
- **Jekyll-Bootstrap Documentation Website.**    
  The documentation website at <http://jekyllbootstrap.com> is maintained in the gh-pages branch.
  Please fork and contribute documentation additions to this branch only.

The master and gh-pages branch do not share the same ancestry. Please treat them as completely separate git repositories!


## License

ronnqvi.st is licensed under [Creative Commons BY-NC](http://creativecommons.org/licenses/by-nc-sa/3.0/)
