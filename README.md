# Boken RPG Engine
This is a little web RPG engine. Developed solely in my spare time and for the purposes of trying to actually build a working game engine from scratch. Hopefully at some point it'll be usable for a real project~

This engine isn't bundling files with WebPack or doing any post-processing apart from using [Compass](http://compass-style.org) to generate the CSS. Simply put, it uses native HTML-JS modules and loads each JS file that makes up the game separately. My intention is for someone to just be able to clone the repo, start a webserver on the root and get playing!

I'm not sure exactly what my plans on this are. I have an RPG in mind that I'm slowly building up along with the engine, but the intention is to allow people to without too much fuss use this for their own games too. We'll see how well that actually goes in practice!


## Compatibility
This engine is unabashedly compatible with really quite new stuff only. If you're not running an up-to-date browser that supports all the latest JS stuff, you likely won't be able to play this.

In addition, mobile is difficult. While the engine can do mobile fine, the control system isn't amazing for use with phones. If I can add compatibility later using media-queries then awesome, but I'm not losing sleep over not being able to play the game on your phone right now.


## Playing
To play this, all you need to do is:

1. Clone the repo.
2. `cd` to the root (this folder).
3. Start a webserver!

There's many different ways to start a webserver. Here's some examples:
```sh
python 2:
    $ python -m SimpleHTTPServer 8000
python 3:
    $ python -m http.server 8000
```
And there's a bunch more located [on this gist](https://gist.github.com/willurd/5720255).

After launching the webserver, simply open up http://localhost:8000/ in a relatively up-to-date web browser! Firefox or Chrome should work fine, but if you do encounter issues on any others please feel free to open an issue detailing the trouble!


## Developing
Make sure to launch the game itself as described above, then:

1. Install [Compass](http://compass-style.org/install/).
2. `cd` to the root (this folder).
3. Run this command to start the style generation: `$ compass watch`

With Compass and the webserver running, you should be able to make any changes and then view them by reloading the page in your web browser.


## Credits
Lots of the GUI and operation of the engine is inspired by (totally stolen from) [Fenoxo](https://www.fenoxo.com) \[NSFW\].
