/**
 * Parses command scripts.
 * @param {Object} config Options with which to initialize CommandParser.
 */
function CommandParser (config) {

  var module = this;

  module.scope = module;
  module.regex = [
    /'[^']*'/g,
    /"[^"]*"/g,
    /\[[^\]]*]/g
  ];
  
  /**
   * Initializes the parser. This is run on class instantiation.
   * @param  {Object} config The initialization object.
   * @param {Object} config.scope The scope with which to run commands.
   * @param {Object} config.commands The commands to bind to specific words.
   */
  module.init = function (config) {
    var prop;
    
    for (prop in config) {
      if (config.hasOwnProperty(prop)) {
        module[prop] = config[prop];
      }
    }
  };
  
  module.init(config);

  /**
   * Begins the parsing process, then begins execution.
   * @param  {String} script The command script to parse.
   */
  module.parse = function (script) {
    var parsed,
        words;
        
    module.clean();
    
    parsed = module.replaceArgs(script);
    parsed = parsed.toLowerCase();

    words = parsed.split(/\s+/g);
    
    module.understand(words);
  };

  /**
   * Used to move on to the next command. This should be called whenever needed
   * in order to advance the command script. In this way, other code can await
   * for an asyncronous action before proceeding to the next command.
   */
  module.next = function () {
    var set = module.queue.shift();

    if (set) {
      module.run.apply(module.scope, set);
    }
  };
  
  /**
   * @private
   * 
   * Searches the script for quoted areas and replaces them with placeholders.
   * @param  {String} script The command script.
   * @return {String}        The command script with placeholders.
   */
  module.replaceArgs = function (script) {
    var i = module.regex.length;
    
    while(i--) {
      script = script.replace(module.regex[i], module.cacheMatch);
    }
    
    return script;
  };

  /**
   * @private
   * 
   * Caches the regex match passed to it and returns a placeholder.
   * @param  {String} match The regex match to cache.
   * @return {String}       The string placeholder.
   */
  module.cacheMatch = function (match) {
    return '{' + module.matches.push(match) + '}';
  };

  /**
   * @private
   * 
   * Goes through each word of the script and decides whether it needs to call
   * a function or be an argument. Functions are expected to be before
   * arguments, so calling the function is delayed until all of its arguments
   * have been gathered. As soon as another function keyword is found, the
   * waiting function gets called with the gathered arguments.
   * @param  {String[]} words An array of the words in the script.
   */
  module.understand = function (words) {
    var last = words.length,
        i = 0,
        args = [],
        command,
        atEnd,
        word;

    for (; i <= last; i++) {
      atEnd = (i === last);
      word = words[i];

      if (module.commands[word] || atEnd) {

        if (command) {
          module.queue.push([command, args]);
          args = [];
        }

        command = module.commands[word];
      } else if (/\{\d+}/.test(word)) {
        word = word.replace(/\{(\d+)}/,'$1');
        word = module.matches[word - 1];
        word = word.substring(1, word.length - 1);
        
        args.push(word);
      } else {
        args.push(word);
      }
    }

    module.next();
  };

  /**
   * @private
   * 
   * Runs the given command with the given arguments.
   * @param  {String} command The command to run.
   * @param  {Mixed} args    The arguments to pass to the command.
   */
  module.run = function (command, args) {
    args.unshift(module);
    command.apply(module.scope, args);
  };
  
  /**
   * @private
   *
   * Cleans up by resetting the regex match list and function queue.
   * @return {[type]} [description]
   */
  module.clean = function () {
    module.matches = [];
    module.queue = [];
  };
  
  return module;
}