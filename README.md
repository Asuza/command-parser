# command-parser
This utility takes a script (written in plain text, not JavaScript) and parses
it so that it may be used to run other JavaScript commands from.

Example script:
```
Walk north and attack Goblin.
Use potion.
Sleep for 30 minutes.
Read sign.
```

Example command parser binding:
```javascript
var CmdP = new CommandParser({
  scope: this,
  commands: {
    walk: function (parser, direction) {
      // Code for walking.
      parser.next();
    },
    attack: function (parser, target) {
      // Code for attacking.
      parser.next();
    },
    use: function (parser, item) {
      // Code for using an item.
      parser.next();
    },
    sleep: function (parser, word, time, unit) {
      // Code for sleeping.
      parser.next();
    },
    read: function (parser, what) {
      // Code for reading.
      parser.next();
    }
  }
});

CmdP.parse(script);
```