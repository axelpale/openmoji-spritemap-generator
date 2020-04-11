# openmoji-spritemap-generator

Generate merged graphics i.e. icon palettes i.e. spritemaps from OpenMoji emojis. Designed for emoji picker developers. Also generates image map HTML code.

## Install

First, clone this repository to your machine.

    $ git clone <this repo>
    $ cd openmoji-spritemap-generator

Second, download openmoji-72x72-color emojis and place them to the project root. Also download the classification data for the emojis.

    $ wget https://github.com/hfg-gmuend/openmoji/releases/latest/download/openmoji-72x72-color.zip
    $ wget https://github.com/hfg-gmuend/openmoji/raw/master/data/openmoji.json

Third, install dependencies and run the merging.

    $ npm install
    $ npm start

Finally, see the merged spritemaps and image map HTML under `spritemaps/`.

## Licence

The generated spritemaps are licensed under [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The source code is licensed under [MIT License](LICENSE).

## See also

- [OpenMoji.org](https://openmoji.org/)
