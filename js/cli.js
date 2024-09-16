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

class CLIClass {
    constructor() {
        this.parent = null
    
        this.lastWrittenText = ''
        this.output = null
        this.input = null
    
        this.typing = true
    
        this.tagsAllowed = false
        this.caseSensitiveCommands = false
    
        this.commandline = ''
        this.commandline_history = []
    
        this.caret_pos = -1
        this.commandline_prepend = '/root~ >'
    
        this.strings = {
            notfound:'{0}:command not found',
            anerror:'{0}: an error occurred\n{1}',
            errorproc:'Processor "{0}": an error occurred: \n{1}'
        }
    
        this.zerojs = null
    
        this.boilerplates = {
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
        }
    
        this.ctrlIsDown = false
    
        this.keyPress = function(event) {
    
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
    
        }
    
        this.keyDown = function(event) {
    
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
        }
    
        this.history_step = 0
    
        this.historyNext = function() {
            if(this.history_step>0)this.history_step-=1;
            var prev = this.commandline_history[this.commandline_history.length - this.history_step];
            if(typeof prev != 'undefined')this.commandline = prev;
            console.log(this.history_step);
        }
    
        this.historyPrev = function() {
            if(this.history_step<this.commandline_history.length)this.history_step+=1;
            var prev = this.commandline_history[this.commandline_history.length - this.history_step];
            if(typeof prev != 'undefined')this.commandline = prev;
            console.log(this.history_step);
        }
    
        this.posBottom = 0
    
        this.scrollDown = function(){
            this.posBottom-=1;
            if(this.posBottom<0)this.posBottom=0;
            this.scrollUpdate();
        }
    
        this.scrollUp = function(){
            this.posBottom+=1;
            this.scrollUpdate();
        }
    
        this.scrollUpdate = function(){
            this.output.style.bottom = (-this.posBottom*1.5+1.5)+"em";
        }
    
        this.enter = function() {
    
            var index = indexOf(this.commandline_history,this.commandline);
            if(index!=-1)this.commandline_history.splice(index,1);
            this.commandline_history.push(this.commandline);
            this.history_step=0;
    
            this.write(this.commandline_prepend + this.commandline.stripTags(this.tagsAllowed));
            this.run(this.commandline);
            this.commandline = '';
    
        }
    
        this.getSuggestion = function(singleCommandchoice){
    
            var acc = [];
    
            for(var ch in choice)
                if(ch.indexOf(singleCommand)==0)
                    acc.push(ch);
    
            if(acc.length == 1)return acc[0];
            else if(acc.length<=0)return '';
            else{
                return acc;
            }
    
        }
    
        this.suggest = function() {
            if(this.commandline.trim() == '')return;
    
            var commands = this.parseCommand(this.commandline);
            var command = commands.command;
    
            var commons = this.getSuggestion(command,
                typeof this.hints[command] == 'function'?this.hints[command](commands,this) : this.commands
            );
    
            if(typeof commons == 'object'){
                this.write(commons.join(' '),false,true);
                commons = getMostCommonSymbols(commons);
            }
    
            this.commandline += commons.substr(command.length);
    
        }
    
        this.notif = function(title, body, icon) {
            window.Notification?"granted"===Notification.permission?serviceWorkerRegistration.showNotification(title,{body:body,icon:icon}):Notification.requestPermission().then(function(o){"granted"===o?serviceWorkerRegistration.showNotification(title,{body:body,icon:icon}):console.log("User blocked notifications.")}).catch(function(o){console.error(o)}):console.log("Browser does not support notifications.");
        }
    
    
        /**
         * Writes line to the console
         * @param {String} text The text to write
         * @param {Boolean} [noBreak] Whether the new line should be created
         * @param {Boolean} [noRepeat] Whether
         */
        this.write = function(text, noBreak, noRepeat) {
            if(noRepeat == true && this.lastWrittenText == text)return;
            this.lastWrittenText = text;
            if(!noBreak)text += '\n';
            var theLine = document.createElement('span');
            theLine.innerHTML = text;
            this.output.appendChild(theLine);
            this.posBottom=0;
            this.scrollUpdate();
            return this;
        }
    
        /** Simply writes a new line */
        this.nl = function() {
            return this.write('');
        }
    
        /** Clears the console */
        this.clear = function() {
            this.output.innerHTML = '';
            this.posBottom=0;
            this.scrollUpdate();
            return this;
        }
    
        /**
         * Run command. This command processes user input.
         * @param {String} commandline The string to be processed as if it was inputted by user.
         */
        this.run = function(commandline) {
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
    
        this.commands = {
            clear: function(data, cli) {
                cli.clear();
            },
            cls: function(data, cli) {
                cli.clear();
            },
            list: function (data, cli) {
                var list = '';
                for(var command in cli.commands){
                    list+=' '+ command;
                }
                cli.write(list);
            },
            link: function (data, cli) {
                let args = data.parameters;
                cli.write(args.toString());
                if (args.length !== 3) {
                    throw new TypeError("Link only accepts two arguments (orignal name, link name)");
                }
                if (!(args[1] in cli.commands)) {
                    throw new TypeError("Nonexistent command to link.");                 
                }
                this.link(args[1], args[2]);
                
            }
                
        }
        
        this.aliases = {}
        this.hints = {}
        this.processors = {
            'default': function(commandLine,cli){
                cli.write(cli.strings.notfound.format(commandLine.command.stripTags(this.tagsAllowed)));
            }
        }
    
        /**
         * Parses command line input. Returns an object containing input parts and the main command.
         * @param {String} text
         * @return {Object}
         */
        this.parseCommand = function(text) {
    
            var parameters = text.match(/".*"|\S+/ig);
            var command = parameters[0].toLower(this.caseSensitiveCommands);
    
            return {
                text: text,
                command: command,
                parameters: parameters,
                parametersText: text.substr(command.length).trim()
            }
    
    
        }
    
        this.caretBack = function() {
            if(this.caret_pos < 0)this.caret_pos = this.commandline.length;
            if(this.caret_pos > 0)this.caret_pos--;
        }
        this.caretNext = function() {
            if(this.caret_pos <= this.commandline.length && this.caret_pos >= 0)this.caret_pos++;
            if(this.caret_pos >= this.commandline.length)this.caret_pos = -1;
        }
        this.caretEnd = function() {
            this.caret_pos = -1;
        }
        this.caretHome = function() {
            this.caret_pos = 0;
        }
    
        this.enterChar = function(char) {
            if(this.caret_pos != -1) {
                this.commandline = this.commandline.substr(0, this.caret_pos) + char + this.commandline.substr(this.caret_pos);
                this.caretNext();
            }
            else this.commandline += char;
        }
    
        this.erase = function() {
            if(this.caret_pos != -1) {
                this.commandline = this.commandline.substr(0, this.caret_pos - 1) + this.commandline.substr(this.caret_pos);
                this.caretBack();
            }
            else this.commandline = this.commandline.substring(0, this.commandline.length - 1);
        }
    
        this.del = function() {
            if(this.caret_pos != -1) {
                this.commandline = this.commandline.substr(0, this.caret_pos) + this.commandline.substr(this.caret_pos + 1);
                if(this.caret_pos >= this.commandline.length)this.caret_pos = -1;
            }
        }
    
        this.renderCommandLine = function() {
            if(this.caret_pos == -1 || this.commandline.trim() == '')this.input.innerHTML = this.commandline_prepend + this.commandline.stripTags() + '<span class="caret"> </span>';
            else {
                var before = this.commandline.substr(0, this.caret_pos).stripTags();
                var curr = this.commandline.substr(this.caret_pos, 1).stripTags();
                var after = this.commandline.substr(this.caret_pos + 1).stripTags();
                this.input.innerHTML = this.commandline_prepend + before + '<span class="caret">' + curr + '</span>' + after;
            }
        }
    
        /**
         * Initialize the cli - generate elements required and attach events.
         * @param objectID
         * @returns {boolean}
         */
        this.init = function(objectID) {
            var mobile = document.createElement('textarea');
            mobile.classList.add('mobile');
            document.body.appendChild(mobile);
            mobile.focus();
            setInterval(() => {
                if (this.typing) {
                    mobile.value = '';
                }
            });
    
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
    
            var that = this;
    
            if (this.typing) document.onkeypress = function(event) {return that.keyPress(event);};
            if (this.typing) document.onkeydown = function(event) {return that.keyDown(event);};

            //this.load();
            
            // setInterval(() => {
                // this.save();
            // });
            
            return true;
        }

        this.save = function() {
            localStorage.setItem('output', btoa(this.output.innerHTML));
            localStorage.setItem('history', btoa(this.commandline_history));
        }

        this.load = function() {
            if (localStorage.getItem('output')) this.output.innerHTML = atob(localStorage.getItem('output'));
            if (localStorage.getItem('history')) this.commandline_history = eval(atob(localStorage.getItem('history')));
        }
    
        /**
         * Calculate the number of characteds that is (by default) can be fitted into a single line.
         * @returns {number}
         */
        this.calculateDim = function() {
            var tempSpan = document.createElement('span');
            tempSpan.innerHTML = "M".repeat(20);    // Black magic
            this.output.appendChild(tempSpan);
    
            var dimX = tempSpan.offsetWidth / 20;
            this.output.removeChild(tempSpan);
            return Math.floor(this.parent.offsetWidth / dimX);
        }
    
        /**
         * Create a command-line parameter, setting callback function as a handler
         * @param {String} name The command to be used
         * @param {Function} callback Handler function
         * @param {Function} [suggest] Function to suggest (if defined - runs on tab press and, if array returned, shows
         * user the list of variants + adds common symbols to user input and, if single value is returned, user input is
         * replaced with it)
         */
        this.extend = function(name, callback, suggest) {
            name = name.toLower(this.caseSensitiveCommands);
            this.commands[name] = callback;
            if(typeof suggest == 'function') this.hints[name] = suggest;
        }
        
        /**
         * Create an hard link to a CLI command. NOTE: This is a hard link. If the main is remvoed it will not affect the alias.
         * @param {String} name The command to be used
         * @param {String} linkname The name of the alias
         */
        this.link = function(name, linkname) {
            linkname = linkname.toLower(this.caseSensitiveCommands);
            name = name.toLower(this.caseSensitiveCommands);
            this.commands[alias] = this.commands[name];
            if (name in this.hints) {
                this.hints[alias] = this.hints[name];
            }
        }
    
        /**
         * Add a callback to process unknown (unrecognized) input. All callbacks will be tried until one of them returns
         * true, except one called 'default', which, if defined, will be called last.
         * @param {String} id And id of processor. The callback will be stored in TheCLI.processors[id].
         * @param {Function} callback The function to process input. If it returns false - the next processor will be called
         */
        this.addProcessor = function(id,callback) {
            this.processors[id] = callback;
        }
    }
}
