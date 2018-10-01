# Wallhaven-fetcher

This project is a command line for downloading image from [Wallhaven](https://alpha.wallhaven.cc/).

You can install it like this : 
```bash
yarn global add wallhaven-fetcher
# or
nmp install -g wallhaven-fetcher
```

Then, you can use it this way : 
```bash
wallhaven blue forest -o wall.jpg
```

Here is the help : 
```
Usage: wallhaven <terms ...>

Options:

  -r, --random         Pick one randomly
  -N, --nsfw           Enable the nsfw filter
  -S, --sketchy        Enable the sketchy filter
  -o, --output [file]  The path to save the file
  -h, --help           output usage information
```