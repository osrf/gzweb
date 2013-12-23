Build Environment Setup
=======================

## Dependencies

Install grunt packages. From the `gzweb/gz3d/utils directory`, run:

      npm install

## Work Flow

1. Make changes to javascript source code in `gzweb/gz3d`

1. Run code check and minify javascript source files. From the `gzweb/gz3d/utils` directory run

        grunt build

1. Copy files to `gzweb/http` where they will be served by the http server. This can just be done by going to the `gzweb/build` directory and run:

         cmake ..

1. Verify your changes by starting gzweb server from the `gzweb` directory:

        ./start_gzweb.sh

1. Open browser to localhost:8080 or just refresh page.
