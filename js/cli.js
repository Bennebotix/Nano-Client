if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number){
            return typeof args[number] != 'undefined' ? args[number]: match;
        });
    };
}

String.prototype.stripTags = function(doornot) {
    if(doornot != true)return this.replace(/</g, '&lt;');
    return this;
}

String.prototype.toLower = function(doornot) {
    if(doornot != true)return this.toLowerCase();
    return this;
}

if(String.prototype.trim == 'undefined')
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };

String.prototype.repeat = function(n) {
    return Array((Math.floor(n) || 1) + 1).join(this);
}

var getMostCommonSymbols = function(words){
    var commonSymbols ='';
    var numOfCommonSymbols = 0;
    var max = 0;
    for(var index in words)if(words[index].length>max)max=words[index].length;

    while(true && numOfCommonSymbols<max){
        numOfCommonSymbols++;
        for(var index in words)
            if(words[index].indexOf(words[0].substr(0,numOfCommonSymbols))!=0)
                return commonSymbols;

        commonSymbols=words[0].substr(0,numOfCommonSymbols);
    }
    return commonSymbols;
};

var indexOf = function(haystack,needle){
    if(Array.prototype.indexOf)window.indexOf = function(haystack,needle){return haystack.indexOf(needle)};
    else window.indexOf = function(haystack,needle){
        var i,index = -1;
        for(i = 0; i < haystack.length; i++)if(haystack[i] === needle) {
            index = i;
            break;
        }
        return index;
    };
    return window.indexOf(haystack,needle);
};

CLI = {

    parent: null,

    lastWrittenText: '',
    output: null,
    input: null,

    typing: true,

    tagsAllowed: false,
    caseSensitiveCommands: false,

    commandline: '',
    commandline_history: [],

    caret_pos: -1,
    commandline_prepend: 'root/$:>',

    strings:{
        notfound:'{0}:command not found',
        anerror:'{0}: an error occurred\n{1}',
        errorproc:'Processor "{0}": an error occurred: \n{1}'
    },

    zerojs:null,

    boilerplates: {
        'txt': '',
        'js': '',
        'html': `
        <!DOCTYPE html>
            
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
            
                    <title>[Title]</title>
                    <meta name="description" content="[Description]">
                    <meta name="author" content="[Name]">
            
                    <meta property="og:title" content="[Title]">
                    <meta property="og:type" content="website">
                    <meta property="og:url" content="[URL]">
                    <meta property="og:description" content="[ Description]">
                    <meta property="og:image" content="[Image: .png]">
            
                    <link rel="icon" href="[Image: .ico]">
                    <link rel="icon" href="[Image: .svg]" type="image/svg+xml">
                    <link rel="apple-touch-icon" href="[Image: .png]">
            
                    <link rel="stylesheet" href="[CSS File]" />
            
              </head>
            
              <body>
                <script src="[JS File]" type="text/javascript"></script>
              </body>
            </html>
        `,
        'css': ''
    },

    ctrlIsDown: false,

    keyPress: function(event) {

        if (this.typing) {
            var keyCode = event.which;
            if(navigator.appName.indexOf("Microsoft") != -1)keyCode = event.keyCode;

            if(((keyCode >= 0x20) && (keyCode < 0x99)) || keyCode > 0xFF) {
                this.enterChar(String.fromCharCode(keyCode));
                this.renderCommandLine();
            }

            event.preventDefault();
        }
        return false;

    },

    keyDown: function(event) {

        if(event.keyCode == 8)this.erase();
        else if(event.keyCode == 33)this.scrollUp();
        else if(event.keyCode == 34)this.scrollDown();
        else if(event.keyCode == 35)this.caretEnd();
        else if(event.keyCode == 36)this.caretHome();
        else if(event.keyCode == 37)this.caretBack();
        else if(event.keyCode == 39)this.caretNext();
        else if(event.keyCode == 46)this.del();
        else if(event.keyCode == 9)this.suggest();
        else if(event.keyCode == 13)this.enter();
        else if(event.keyCode == 38)this.historyPrev();
        else if(event.keyCode == 40)this.historyNext();

        this.renderCommandLine();

        if([8, 9, 13].indexOf(event.keyCode) != -1)return false;
    },

    history_step:0,

    historyNext: function() {
        if(this.history_step>0)this.history_step-=1;
        var prev = this.commandline_history[this.commandline_history.length - this.history_step];
        if(typeof prev != 'undefined')this.commandline = prev;
        console.log(this.history_step);
    },

    historyPrev: function() {
        if(this.history_step<this.commandline_history.length)this.history_step+=1;
        var prev = this.commandline_history[this.commandline_history.length - this.history_step];
        if(typeof prev != 'undefined')this.commandline = prev;
        console.log(this.history_step);
    },

    posBottom:0,

    scrollDown:function(){
        this.posBottom-=1;
        if(this.posBottom<0)this.posBottom=0;
        this.scrollUpdate();
    },

    scrollUp:function(){
        this.posBottom+=1;
        this.scrollUpdate();
    },

    scrollUpdate:function(){
        this.output.style.bottom = (-this.posBottom*1.5+1.5)+"em";
    },

    enter: function() {

        var index = indexOf(this.commandline_history,this.commandline);
        if(index!=-1)this.commandline_history.splice(index,1);
        this.commandline_history.push(this.commandline);
        this.history_step=0;

        this.write(this.commandline_prepend + this.commandline.stripTags(this.tagsAllowed));
        this.run(this.commandline);
        this.commandline = '';

    },

    getSuggestion:function(singleCommand,choice){

        var acc = [];

        for(var ch in choice)
            if(ch.indexOf(singleCommand)==0)
                acc.push(ch);

        if(acc.length == 1)return acc[0];
        else if(acc.length<=0)return '';
        else{
            return acc;
        }

    },

    suggest: function() {
        if(this.commandline.trim() == '')return;

        var commands = this.parseCommand(this.commandline);
        var command = commands.command;

        var commons = this.getSuggestion(command,
            typeof this.hints[command] == 'function'?this.hints[command](commands,this):this.commands
        );

        if(typeof commons == 'object'){
            this.write(commons.join(' '),false,true);
            commons = getMostCommonSymbols(commons);
        }

        this.commandline += commons.substr(command.length);

    },

    notif: function(title, body, icon) {
        window.Notification?"granted"===Notification.permission?serviceWorkerRegistration.showNotification(title,{body:body,icon:icon}):Notification.requestPermission().then(function(o){"granted"===o?serviceWorkerRegistration.showNotification(title,{body:body,icon:icon}):console.log("User blocked notifications.")}).catch(function(o){console.error(o)}):console.log("Browser does not support notifications.");
    },


    /**
     * Writes line to the console
     * @param {String} text The text to write
     * @param {Boolean} [noBreak] Whether the new line should be created
     * @param {Boolean} [noRepeat] Whether
     */
    write: function(text, noBreak,noRepeat) {
        if(noRepeat == true && this.lastWrittenText == text)return;
        this.lastWrittenText = text;
        if(!noBreak)text += '\n';
        var theLine = document.createElement('span');
        theLine.innerHTML = text;
        this.output.appendChild(theLine);
        this.posBottom=0;
        this.scrollUpdate();
        return this;
    },

    /** Simply writes a new line */
    nl: function() {
        return this.write('');
    },

    /** Clears the console */
    clear: function() {
        this.output.innerHTML = '';
        this.posBottom=0;
        this.scrollUpdate();
        return this;
    },

    /**
     * Run command. This command processes user input.
     * @param {String} commandline The string to be processed as if it was inputted by user.
     */
    run: function(commandline) {
        commandline = commandline.trim();
        if(commandline == '')return;

        commandline = this.parseCommand(commandline);
        if(typeof this.commands[commandline.command] != 'undefined') {
            try {
                this.commands[commandline.command](commandline, this);
            }
            catch(e) {
                this.write(this.strings.anerror.format(commandline.command.stripTags(this.tagsAllowed),e.message)).nl();
            }
        }
        else {
            for(var name in this.processors){
                if(name!='default' && typeof this.processors[name] == 'function'){
                    var result = false;
                    try{
                        result = this.processors[name](commandline,this);
                    }
                    catch (e){
                        this.write(this.strings.errorproc.format(name.stripTags(this.tagsAllowed),e.message)).nl();
                    }
                    if(result)return;
                }
            }
            if(typeof this.processors.default == 'function')this.processors.default(commandline,this);
        }
    },

    commands: {
        clear: function(data, cli) {
            cli.clear();
        },
        cls: function(data, cli) {
            cli.clear();
        },
        motd: function(data, cli) {
            cli.clear();
            cli.write('<a href="https://github.com/Bennebotix/Mega-Bitz">CLI [version 1.2.4000]</a>')
                .nl()
                .write('Type <b>list</b> to get list of commands available')
                .nl();
        },
        list: function (data, cli) {
            var list = '';
            for(var command in cli.commands){
                list+=' '+ command;
            }
            cli.write(list);
        }
    },

    hints: {},
    processors: {
        'default':function(commandLine,cli){
            cli.write(cli.strings.notfound.format(commandLine.command.stripTags(this.tagsAllowed)));
        }
    },

    /**
     * Parses command line input. Returns an object containing input parts and the main command.
     * @param {String} text
     * @return {Object}
     */
    parseCommand: function(text) {

        var parameters = text.match(/".*"|\S+/ig);
        var command = parameters[0].toLower(this.caseSensitiveCommands);

        return {
            text: text,
            command: command,
            parameters: parameters,
            parametersText: text.substr(command.length).trim()
        }


    },

    caretBack: function() {
        if(this.caret_pos < 0)this.caret_pos = this.commandline.length;
        if(this.caret_pos > 0)this.caret_pos--;
    },
    caretNext: function() {
        if(this.caret_pos <= this.commandline.length && this.caret_pos >= 0)this.caret_pos++;
        if(this.caret_pos >= this.commandline.length)this.caret_pos = -1;
    },
    caretEnd: function() {
        this.caret_pos = -1;
    },
    caretHome: function() {
        this.caret_pos = 0;
    },

    enterChar: function(char) {
        if(this.caret_pos != -1) {
            this.commandline = this.commandline.substr(0, this.caret_pos) + char + this.commandline.substr(this.caret_pos);
            this.caretNext();
        }
        else this.commandline += char;
    },

    erase: function() {
        if(this.caret_pos != -1) {
            this.commandline = this.commandline.substr(0, this.caret_pos - 1) + this.commandline.substr(this.caret_pos);
            this.caretBack();
        }
        else this.commandline = this.commandline.substring(0, this.commandline.length - 1);
    },

    del: function() {
        if(this.caret_pos != -1) {
            this.commandline = this.commandline.substr(0, this.caret_pos) + this.commandline.substr(this.caret_pos + 1);
            if(this.caret_pos >= this.commandline.length)this.caret_pos = -1;
        }
    },

    renderCommandLine: function() {
        if(this.caret_pos == -1 || this.commandline.trim() == '')this.input.innerHTML = this.commandline_prepend + this.commandline.stripTags() + '<span class="caret"> </span>';
        else {
            var before = this.commandline.substr(0, this.caret_pos).stripTags();
            var curr = this.commandline.substr(this.caret_pos, 1).stripTags();
            var after = this.commandline.substr(this.caret_pos + 1).stripTags();
            this.input.innerHTML = this.commandline_prepend + before + '<span class="caret">' + curr + '</span>' + after;
        }
    },

    /**
     * Initialize the cli - generate elements required and attach events.
     * @param objectID
     * @returns {boolean}
     */
    init: function(objectID) {

        var mobile = document.createElement('textarea');
        mobile.classList.add('mobile');
        document.body.appendChild(mobile);
        setInterval(() => {
            if (this.typing) {
                mobile.focus();
                mobile.value = '';
            }
        })


        var parent = document.querySelector('#' + objectID);

        parent.classList.add('cli_instance');

        if(typeof parent == 'undefined') {
            console.error(objectID + ' not found :(');
            return false;
        }

        parent.innerHTML='';

        var output = parent.getElementsByClassName('output');
        if(output.length < 1) {
            output = document.createElement('div')
            output.className = "output";
            parent.appendChild(output);
        }
        else output = output[0];

        var input = parent.getElementsByClassName('input');
        if(input.length < 1) {
            input = document.createElement('div');
            input.className = "input";
            parent.appendChild(input);
        }
        else input = input[0];

        this.parent = parent;
        this.output = output;
        this.input = input;

        parent.onfocus = function(e) {
            if (this.typing) {
                e.blur();
            }
        };

        this.renderCommandLine();

        if(this.commands.motd != undefined)this.run('motd');

        var that = this;

        if (this.typing) document.onkeypress = function(event) {return that.keyPress(event);};
        if (this.typing) document.onkeydown = function(event) {return that.keyDown(event);};

        return true;
    },

    /**
     * Calculate the number of characteds that is (by default) can be fitted into a single line.
     * @returns {number}
     */
    calculateDim: function() {
        var tempSpan = document.createElement('span');
        tempSpan.innerHTML = "M".repeat(20);    // Black magic
        this.output.appendChild(tempSpan);

        var dimX = tempSpan.offsetWidth / 20;
        this.output.removeChild(tempSpan);
        return Math.floor(this.parent.offsetWidth / dimX);
    },

    /**
     * Create a command-line parameter, setting callback function as a handler
     * @param {String} name The command to be used
     * @param {Function} callback Handler function
     * @param {Function} [suggest] Function to suggest (if defined - runs on tab press and, if array returned, shows
     * user the list of variants + adds common symbols to user input and, if single value is returned, user input is
     * replaced with it)
     */
    extend: function(name, callback, suggest) {
        name = name.toLower(this.caseSensitiveCommands);
        this.commands[name] = callback;
        if(typeof suggest == 'function')this.hints[name] = suggest;
    },

    /**
     * Add a callback to process unknown (unrecognized) input. All callbacks will be tried until one of them returns
     * true, except one called 'default', which, if defined, will be called last.
     * @param {String} id And id of processor. The callback will be stored in TheCLI.processors[id].
     * @param {Function} callback The function to process input. If it returns false - the next processor will be called
     */
    addProcessor: function(id,callback){
        this.processors[id] = callback;
    }
};
